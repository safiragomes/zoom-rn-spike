# Teste do Zoom Video SDK nativo (React Native / Expo) — spike ValeDOC

Spike isolado, fora de qualquer repositório do projeto. Objetivo: responder se o
`@zoom/react-native-videosdk` roda em Expo Go ou exige development build, se a troca de
câmera funciona durante a chamada, e se a transcrição ao vivo chega a um backend.

**Histórico de decisões**: a primeira versão deste spike era um app Expo em branco
(`create-expo-app`) com um único `App.js`. Depois de confirmar que o SDK exige development
build (T1), o app foi **reconstruído do zero como uma cópia real do boilerplate
`ValeDOC-mobile`** (não um projeto do zero), para que os resultados — versões, erros de build,
convenções — valham diretamente para o projeto real e não para um setup arbitrário. O
`ValeDOC-mobile` em si **não foi alterado**, só lido como referência.

## Checklist — achados da semana

- [x] **Zoom: o componente nativo roda no build padrão do Expo ou exige development build?
      É o achado mais importante da semana.**
      **Exige development build.** Confirmado com teste real em device físico: ao abrir no
      Expo Go, o app quebra imediatamente (`TypeError: Cannot read property 'isChatDisabled'
      of null`) porque o SDK tem módulos nativos (Kotlin/Swift) que não existem no binário
      padrão do Expo Go — não há como contornar, é arquitetural (o pacote não tem
      `app.plugin.js`/`expo-module.config.json`, então o Expo Go nunca vai incluir esse código
      nativo). O development build **funciona** (compilado e instalado via EAS Build, depois
      de corrigir 4 bugs reais de integração), mas **tem um problema de estabilidade não
      resolvido**: o vídeo trava de forma intermitente (ANR) em uso normal, sem gatilho único
      identificado. "Exige dev build" está confirmado com certeza; "o dev build está pronto
      pra produção" não está — ver bug #5.

- [ ] **Zoom: confirmar que a transcrição ao vivo funciona no SDK mobile e que o texto chega
      ao backend. Registrar também o modelo de créditos.**
      **Não totalmente confirmável — bloqueado pela conta, não pelo código.** O envio pro
      backend **funciona**: testei o endpoint `POST /transcript` isoladamente e ele grava
      corretamente. A transcrição em si **não pôde ser testada com fala real**:
      `canStartLiveTranscription()` retorna `false` de forma consistente nesta conta. Pela
      documentação da Zoom, Live Transcription é um **add-on pago** do Video SDK — se não
      contratado, o método sempre retorna `false`, independente do código. **Modelo de
      créditos: não registrado** — não pesquisei preço/plano porque depende do comercial da
      Zoom, não é algo que dá pra descobrir só testando o SDK. Item continua em aberto:
      precisa alguém com acesso à conta/contrato Zoom confirmar se o add-on está disponível e
      qual o custo.

## Ambiente

| Item | Valor |
|---|---|
| Máquina de desenvolvimento | Linux 7.0.0-38-generic — sem Android SDK, sem JDK, sem Xcode, sem `adb` instalados |
| Aparelho físico de teste | Celular Motorola Android do usuário, via Wi-Fi local |
| Node | v22.22.3 (local) / **Node 24** no build EAS (lido automaticamente do `.nvmrc`, igual ao `ValeDOC-mobile`) |
| Gerenciador de pacotes | **pnpm 10.24.0** via Corepack, `node-linker=hoisted` — igual ao `ValeDOC-mobile` (decisão D7: layout flat porque autolinking/Metro/Jest do RN presumem `node_modules` plano) |
| Expo SDK | **57.0.26** — pinado exatamente igual ao `ValeDOC-mobile` (não a última patch disponível, `57.0.27`; essa é uma escolha deliberada de fidelidade, não desatualização) |
| React Native | 0.86.3 (igual ao `ValeDOC-mobile`) |
| React | 19.2.3 (igual ao `ValeDOC-mobile`) |
| `@zoom/react-native-videosdk` | **2.6.1** (latest no npm), pin exato sem `^`/`~` |
| Build nativo | **EAS Build** (`eas-cli`), perfil `development`, `distribution: internal`, `buildType: apk`. `expo run:android` / `expo run:ios` locais **não testados** — não há Android SDK/JDK nem Xcode em nenhuma máquina envolvida (nem este ambiente, nem o PC/celular do usuário). |
| Conta EAS | `safira.gomes` (conta pessoal, projeto `@safira.gomes/zoom-rn-spike`) — separado de qualquer projeto EAS do `ValeDOC-mobile` real |

Nenhum conflito de peer-dependency apareceu entre Expo 57 e o SDK do Zoom (`npm install` /
`pnpm install` e `expo-doctor` passam, a única reclamação do doctor são as patches 1 versão
atrás do que ele recomenda — esperado, pin deliberado). Os conflitos reais apareceram **no
build nativo**, documentados abaixo.

## Estrutura atual

```
zoom-rn-spike/
├── server/                    # Express: GET /token, POST /transcript
│   ├── index.js
│   ├── .env                   # ZOOM_SDK_KEY/ZOOM_SDK_SECRET copiados do server/.env do app web, git-ignorado
│   └── transcripts.jsonl
├── app/                       # Cópia real do boilerplate ValeDOC-mobile
│   ├── src/app/index.tsx      # rota — só importa a screen (R1)
│   ├── src/features/zoom-spike/
│   │   ├── index.ts           # API pública da feature (R3)
│   │   ├── components/zoom-spike-screen.tsx
│   │   ├── hooks/use-zoom-spike.ts   # estado + chamadas ao SDK + permissões Android
│   │   └── services/zoom-spike-service.ts  # fetchToken / postTranscript via httpClient (R5)
│   ├── src/providers/app-providers.tsx  # ZoomVideoSdkProvider entrou aqui
│   ├── src/config/env.ts      # EXPO_PUBLIC_SPIKE_SERVER_URL tipado
│   ├── test/setup.ts          # mock do @zoom/react-native-videosdk pros testes existentes não quebrarem
│   ├── app.json               # permissões + plugin expo-build-properties (minSdkVersion 28)
│   └── eas.json
└── app-flat-backup/            # versão descartada (Expo em branco) — mantida só de referência histórica
```

Tudo isso **fora** de qualquer repositório do projeto, com `.git` próprio e isolado (criado só
porque o EAS Build exige um repositório git local para enviar o snapshot do projeto).

## Bugs reais encontrados e corrigidos

Nenhum destes foi inventado — todos vieram de logs reais de build ou de crash em device.

### 1. `minSdkVersion` do Android

```
Manifest merger failed : uses-sdk:minSdkVersion 24 cannot be smaller than version 28
declared in library [:zoom_react-native-videosdk] .../android/build/intermediates/
merged_manifest/debug/processDebugManifest/AndroidManifest.xml as the library might be
using APIs not available in 24
```

O módulo nativo do Zoom declara `minSdkVersion 28`; o padrão do Expo/RN é 24. **Correção**: plugin
`expo-build-properties` em vez de editar `android/build.gradle` à mão (que some a cada
`expo prebuild`):

```json
// app.json
["expo-build-properties", { "android": { "minSdkVersion": 28 } }]
```

### 2. `pnpm install --frozen-lockfile` falhando só no CI do EAS

```
[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: yarn@1.22.22
Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.
pnpm install --frozen-lockfile exited with non-zero code: 1
```

`@zoom/react-native-videosdk` declara `yarn` como dependência direta (só pra scripts internos
do pacote, nada a ver com nosso projeto). Localmente o pnpm só avisa; em `--frozen-lockfile`
(modo que o EAS usa) ele falha. **Correção**: declarar explicitamente que esse script pode ser
ignorado, igual ao `ValeDOC-mobile` já faz para o `@fission-ai/openspec`:

```json
// package.json
"pnpm": { "ignoredBuiltDependencies": ["@fission-ai/openspec", "yarn"] }
```

### 3. Crash nativo ao entrar na sessão: `autoAdjustSpeakerVolume`

Depois dos dois fixes acima, o build **compilou e instalou** — mas o primeiro `joinSession()`
derrubava o app inteiro:

```
java.lang.NullPointerException: Parameter specified as non-null is null: method
com.facebook.react.bridge.PromiseImpl.reject, parameter userInfo
  com.reactnativezoom.videosdk.RNZoomVideoSdkModule$1.run(RNZoomVideoSdkModule.java:268)
 ERROR  [Error: Exception in HostFunction: autoAdjustSpeakerVolume]
```

O TypeScript marca `audioOptions.autoAdjustSpeakerVolume` como opcional, mas a implementação
nativa Android faz unboxing de um `Boolean` sem checar nulo — se o campo não vier, dá NPE (e
até o `Promise.reject` do erro quebra, por isso o app crasha em vez de só rejeitar a promise).
**Correção**: sempre passar o campo explicitamente.

```ts
// src/features/zoom-spike/hooks/use-zoom-spike.ts
audioOptions: { connect: true, mute: false, autoAdjustSpeakerVolume: true },
```

Isso é um bug real do wrapper nativo do SDK (campo "opcional" que não é tratado como opcional
no lado Kotlin/Java) — vale reportar pro suporte da Zoom se isso for pra produção.

### 4. Tela de vídeo preta — permissão de câmera nunca pedida

Depois do fix #3, `joinSession()` funcionou — mas a tela de vídeo ficava preta, sem erro
nenhum. Causa: declarar `CAMERA`/`RECORD_AUDIO` em `app.json` só coloca a permissão no
`AndroidManifest.xml`; o Android ainda exige o **pedido em tempo de execução** (API 23+), e o
SDK do Zoom não faz esse pedido sozinho — ele só retorna um código de erro para
`RECORD_AUDIO` ausente, e falha **silenciosamente** (sem erro, view vazia) quando falta
`CAMERA`. **Correção**: pedir a permissão explicitamente antes de entrar na sessão.

```ts
// src/features/zoom-spike/hooks/use-zoom-spike.ts
const granted = await PermissionsAndroid.requestMultiple([
  PermissionsAndroid.PERMISSIONS.CAMERA,
  PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
]);
```

**Status**: **confirmado em device** — câmera liga e mostra a própria imagem. Permissão já
estava concedida manualmente (usuário foi em Ajustes > Apps antes de eu confirmar que o código
também pedia em runtime), então o pop-up em si não foi observado diretamente, mas o resultado
(câmera funcionando) confirma que a permissão está sendo respeitada.

### 5. Travamento ao ligar vídeo — histórico do diagnóstico (ver estado atual no item mais abaixo)

Logo depois do fix #4, o app conectava e mostrava a própria câmera, mas travava (ANR — Android
Not Responding) alguns segundos depois, com qualquer vídeo ligado. **Diagnóstico isolado**:
adicionei um switch "Local video" na tela para testar entrar **só com áudio**
(`videoOptions.localVideoOn: false`). Resultado: **sem vídeo, não trava** — confirma que o
travamento é específico da renderização de vídeo (`ZoomView`), não da sessão/SDK em geral.

Pesquisei no fórum de desenvolvedores da Zoom e encontrei relatos de ANR não resolvidos
nessa SDK em Android ([thread oficial](https://devforum.zoom.us/t/react-native-android-anr/117181),
sem solução da Zoom até o momento do post) — uma classe de problema conhecida e sem fix
documentado.

Depois do fix de orientação (#6 abaixo), **a câmera frontal parou de travar** nos testes
seguintes. O travamento reapareceu de forma mais específica ao trocar para a câmera
**traseira** — ver a seção "5. Travamento ao trocar para a câmera traseira" mais abaixo
(renumerada depois do #6 porque só ficou precisa depois desse fix).

### 6. Câmera renderiza deitada (landscape) em vez de vertical — resolvido para a câmera frontal

Mesmo com `android:screenOrientation="portrait"` corretamente aplicado no `AndroidManifest.xml`
(confirmado), o vídeo local renderizava de lado. Pesquisei no fórum da Zoom
([thread 1](https://devforum.zoom.us/t/orientation-issue-of-video-view-in-react-native-android/102475),
[thread 2](https://devforum.zoom.us/t/change-video-orientation-on-react-web-and-android-sdk/101056)) —
é um problema conhecido e sem solução oficial confirmada em Android.

**Causa, confirmada lendo o código-fonte nativo instalado**
(`node_modules/@zoom/react-native-videosdk/android/.../RNZoomViewManager.java`): o wrapper só
chama `rotateMyVideo` sozinho quando o Android dispara um evento de **mudança** de rotação da
tela (`DisplayManager.DisplayListener.onDisplayChanged`). Se o celular nunca gira fisicamente
depois que a chamada começa, esse evento nunca dispara, e a correção nunca é aplicada — por
isso a câmera nasce deitada. O parâmetro de `rotateMyVideo` também não é graus: é
`android.view.Surface.ROTATION_0..3` (0/1/2/3), lido de `display.getRotation()`.

```java
// RNZoomViewManager.java
protected void refreshRotation() {
  int displayRotation = display.getRotation(); // 0,1,2 ou 3 — não graus
  if (currentRotation != displayRotation) {
    ZoomVideoSDK.getInstance().getVideoHelper().rotateMyVideo(displayRotation);
    currentRotation = displayRotation;
  }
}
```

**Correção, confirmada funcionando**: chamar `rotateMyVideo(0)` manualmente uma vez, logo
depois de `joinSession`, quando o vídeo está ligado — `0` é o valor que o celular (em pé,
orientação natural retrato) teria de qualquer forma, só que aplicado de forma proativa em vez
de esperar um evento que nunca chega.

```ts
// src/features/zoom-spike/hooks/use-zoom-spike.ts
if (videoOn) {
  try {
    await zoom.videoHelper.rotateMyVideo(0);
  } catch (cause) {
    console.warn("[zoom-spike] rotateMyVideo failed", cause);
  }
}
```

Tentativas que **não** funcionaram antes de chegar nessa, documentadas porque custaram tempo
real de debug:
- `zoom.videoHelper.rotateMyVideo(90)` (90 graus) — **piorou**: câmera parou de mostrar
  qualquer imagem. Confirma que o parâmetro não é graus.
- `zoom.videoHelper.rotateMyVideo(1)` — não corrigiu.
- `zoom.videoHelper.rotateMyVideo(3)` — não corrigiu.
- `videoAspect={VideoAspect.LetterBox}` na `ZoomView` — mantido ativo (é inofensivo e é a
  recomendação oficial da Zoom para problemas de corte/aspecto), mas **não resolve rotação
  sozinho**.

**Status**: **resolvido para a câmera frontal** (padrão ao entrar na sessão). **Não resolvido
para a câmera traseira** — ver bug #5 abaixo, que ficou mais preciso depois desse fix.

### 5. Travamento (ANR) intermitente no vídeo — não resolvido, não determinístico

Histórico de observações, na ordem em que aconteceram:

1. Antes do fix #6, travava (ANR) alguns segundos depois de ligar qualquer vídeo. Áudio
   sozinho não travava — isolei o problema como específico de `ZoomView`.
2. Depois do fix #6 (`rotateMyVideo(0)` no join), vários testes seguidos com a câmera frontal
   **não travaram**.
3. Travou de novo ao trocar para a câmera **traseira** com `switchCamera()`. Testei reaplicar
   `rotateMyVideo(0)` depois do `switchCamera()` — piorou (tela preta, sem travar). Revertido.
4. Num teste seguinte, capturei no log do Metro (que até então não estava refletindo em tempo
   real por um problema de buffer no meu lado) que **a troca de câmera funcionou duas vezes
   seguidas sem travar**, e o crash só apareceu depois, coincidindo com um **reload do
   Metro/Fast Refresh enquanto a sessão Zoom nativa ainda estava ativa**:
   ```
   LOG  Switching camera...
   LOG  Camera switched.
   LOG  Switching camera...
   LOG  Camera switched.
   Android Bundled ...                          <- reload do JS em cima de sessão nativa ativa
   ERROR  Your app just crashed. ... RNZoomVideoSdkModule$1.run(RNZoomVideoSdkModule.java:268)
   ```
5. Pedi para reiniciar o celular por completo (não só fechar o app) — a
   [doc do `expo-camera`](https://docs.expo.dev/versions/latest/sdk/camera/) confirma que o
   Android só permite um dono por vez do hardware da câmera; se uma sessão crashada não
   libera o recurso direito, a câmera pode ficar "presa" até reiniciar. Não sei se o usuário
   chegou a reiniciar antes do próximo teste.
6. **No teste seguinte, a câmera frontal — que já tinha funcionado várias vezes — travou de
   novo**, sem trocar de câmera, só entrando na chamada normalmente.

**Conclusão**: isto não é mais um bug "trocar para a traseira trava". É um **travamento
intermitente e não determinístico** em qualquer uso de vídeo, mais provável de aparecer perto
de uma troca de câmera ou de um reload do JS com sessão nativa ativa, mas não exclusivo
disso — já vi a frontal travar sozinha depois de ter funcionado. Esse padrão (intermitente,
sem gatilho único e confiável) bate com a classe de ANR relatada por outros desenvolvedores no
fórum da Zoom, sem solução oficial.

**Status**: **não resolvido, e provavelmente não resolvível só por tentativa e erro em
código**. Já troquei um bug visível por outro silencioso duas vezes tentando "consertar" via
`rotateMyVideo` — parei de insistir nessa linha. O próximo passo real precisa de uma dessas
duas coisas, que não tenho neste ambiente:
- Um logcat real (`adb logcat`) capturado no exato momento do travamento, em uma máquina com
  Android Studio/`adb` instalado.
- Um ticket aberto com o suporte da Zoom, citando o modelo do aparelho (Motorola), a versão
  do SDK (`2.6.1`), os passos de reprodução acima, e os threads do fórum já linkados (que têm
  o mesmo padrão sem solução).

### Transcrição removida da tela

`canStartLiveTranscription()` retorna `false` de forma consistente nesta conta. Pesquisei a
documentação da Zoom: Live Transcription é um **add-on pago** da conta do Video SDK — se não
contratado, o método sempre retorna `false`. Se alguém tentasse forçar
`startLiveTranscription()` mesmo assim, os códigos de erro esperados seriam `7300`
(`TRANSCRIPTION_ACCOUNT_DISABLE`) ou `7301` (`TRANSCRIPTION_FEATURE_DISABLE`). **Não é bug de
código** — removi o botão "CC" e o painel de transcrição da tela por não ser utilizável nesta
conta, mas o hook (`useZoomSpike`) mantém a implementação completa
(`canTranscribe`, `languages`, `messages`, `startTranscription`) como referência pronta para
quando o add-on for contratado.

## Tabela de testes

| Teste | O que foi feito | Resultado | Evidência |
|---|---|---|---|
| **T1** — abrir no Expo Go | `npx expo start`, abriu no Expo Go físico via `exp://192.168.10.101:8081`. | **Confirmado: NÃO roda no Expo Go.** Tela vermelha "Runtime not ready" imediatamente ao carregar. | Print em `evidencias/t1-expo-go-erro.jpeg`; erro exato abaixo. |
| **T2** — development build | `expo prebuild` local + 3 builds no EAS (os dois primeiros falharam com erros reais, documentados acima; o terceiro, já na estrutura do boilerplate, **terminou com sucesso** — `status: finished`, APK em `https://expo.dev/artifacts/eas/j-7rh2lL7Tc8H9W9eYAS636OZCvu4uhE90Phlju61as.apk`). Instalado no celular via link da página do build. `npx expo start --dev-client` conectando normalmente, com Fast Refresh. | **Compila e instala sem problema.** `joinSession` crashava (bug #3), corrigido e confirmado. Vídeo preto por falta de permissão (bug #4), corrigido e confirmado. Orientação da câmera frontal (bug #6), corrigido e confirmado. **Mas o vídeo trava de forma intermitente e não determinística** (bug #5) — às vezes funciona bem por vários minutos, às vezes trava logo. | Logs de build; ver "Bugs reais" acima. |
| **T3** — segunda ponta (celular + web) | Não testado — o travamento intermitente (bug #5) torna qualquer teste que dependa da chamada ficar de pé por tempo suficiente não confiável no momento. | **Bloqueado pela instabilidade do bug #5.** | — |
| **T4** — trocar câmera em chamada | **Parcialmente confirmado**: `switchCamera()` já funcionou (troca de lente de fato, duas vezes seguidas num dos testes) e já travou em outros testes — sem padrão confiável. Vídeo na câmera traseira também renderiza deitado (a correção de orientação só foi aplicada para a frontal, no join). | **Funciona de forma intermitente** — não dá pra dizer "funciona" nem "não funciona" com confiança. | Trecho de código abaixo. |
| **T5** — transcrição falada | Endpoint `/transcript` testado isoladamente com `curl` (funciona). `canStartLiveTranscription()` testado em sessão real: **retorna `false`** de forma consistente. Confirmado via documentação da Zoom que é add-on pago não contratado nesta conta — não é bug. | **Backend ok; recurso não disponível nesta conta** (comercial). Botão removido da tela. | `transcripts.jsonl` abaixo; seção "Transcrição removida da tela" acima. |
| **T6** — anfitrião vs. participante | Não testado — mesma razão de T3. | **Bloqueado pela instabilidade do bug #5.** | — |

### Log real do T1 (Expo Go)

```
[runtime not ready]: TypeError: Cannot read property 'isChatDisabled' of null, stack:
<instance_members_initializer: ZoomVideoSdkChatHelper>@100284:45
ZoomVideoSdkChatHelper@100283:2
...
```

Causa: `ZoomVideoSdkChatHelper` acessa uma propriedade do módulo nativo
`NativeModules.RNZoomVideoSdkChatHelper` na inicialização dos campos da instância — e esse
módulo não existe no binário genérico do Expo Go. Quebra antes de qualquer tela renderizar.

### Evidência de autolinking (T2)

```json
"@zoom/react-native-videosdk": {
  "platforms": {
    "android": {
      "sourceDir": ".../node_modules/@zoom/react-native-videosdk/android",
      "packageImportPath": "import com.reactnativezoom.videosdk.RNZoomVideoSdkPackage;",
      "packageInstance": "new RNZoomVideoSdkPackage()"
    }
  }
}
```

Dependências nativas públicas confirmadas por HTTP real: Maven Central
(`us/zoom/videosdk/zoomvideosdk-core/2.6.0` → 200) e CocoaPods trunk (`ZoomVideoSDK` 2.6.0 →
200) — não é preciso repositório Maven customizado da Zoom, diferente do que o README do
pacote sugere.

## O que NÃO foi testado ainda (e por quê)

- **T3–T6**: dependem da confirmação de que a correção de permissão de câmera (bug #4)
  resolveu o problema. Assim que confirmado, seguimos pra chamada com dois participantes.
- **`expo run:android` local**: nunca testado — não há Android SDK/JDK em nenhuma máquina
  envolvida no spike. O EAS Build supre essa necessidade, mas isso significa que qualquer
  iteração de mudança **nativa** (não JS) depende de disparar um novo build na nuvem (alguns
  minutos de espera), não de um comando local instantâneo.
- **Se a conta/licença Zoom tem "Live Transcription" liberada**: só aparece quando
  `canStartLiveTranscription()` rodar dentro de uma sessão real (T5).
- **iOS**: nada testado — o usuário só tem Android físico disponível.

## Passo a passo atual (retomar os testes)

1. **Servidor local** (se não estiver rodando):
   ```bash
   cd /home/safira/zoom-rn-spike/server && npm run dev
   ```
2. **Metro com dev client**:
   ```bash
   cd /home/safira/zoom-rn-spike/app && npx expo start --dev-client
   ```
3. Abrir o app já instalado no celular (não precisa reinstalar — só mudanças em `app.json`,
   plugins ou dependências nativas exigem novo build, [regra do próprio `AGENTS.md` do
   `ValeDOC-mobile`]).
4. Tocar "Entrar" → deve pedir permissão de câmera/microfone (bug #4) → aceitar → verificar se
   o vídeo local aparece.
5. Dali em diante, T3 (segunda ponta pelo app web) → T4 (trocar câmera) → T5 (transcrição) → T6
   (anfitrião vs. participante), nessa ordem, cada um só faz sentido depois do anterior.

Se algo der erro, mandar o texto exato (ou print) — não vou registrar como "funcionou" sem
confirmação real.

## Trechos de código

### Troca de câmera (`src/features/zoom-spike/hooks/use-zoom-spike.ts`)

```ts
const switchCamera = useCallback(async () => {
  if (!zoom || !connected || cameraBusy) return;
  try {
    setCameraBusy(true);
    const ok = await zoom.videoHelper.switchCamera();
    const cameras = await zoom.videoHelper.getCameraList();
    setCameraList(cameras);
    log(ok ? "Camera switched." : "switchCamera returned false.");
  } catch (cause) {
    log(`Failed to switch camera: ${cause instanceof Error ? cause.message : cause}`);
  } finally {
    setCameraBusy(false);
  }
}, [zoom, connected, cameraBusy, log]);
```

### Permissões + transcrição (`use-zoom-spike.ts`)

```ts
const requestMediaPermissions = useCallback(async () => {
  if (Platform.OS !== "android") return;
  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  ]);
  const denied = Object.entries(granted).filter(
    ([, result]) => result !== PermissionsAndroid.RESULTS.GRANTED,
  );
  if (denied.length > 0) {
    throw new Error(`Permission denied: ${denied.map(([p]) => p).join(", ")}`);
  }
}, []);

const startTranscription = useCallback(async () => {
  const canStart = await zoom.liveTranscriptionHelper.canStartLiveTranscription();
  if (!canStart) { log("canStartLiveTranscription returned false."); return; }

  const languages = await zoom.liveTranscriptionHelper.getAvailableSpokenLanguages();
  const portuguese = languages.find((l: SpokenLanguage) => /portug/i.test(l.languageName));
  if (portuguese) zoom.liveTranscriptionHelper.setSpokenLanguage(portuguese.languageId);

  await zoom.liveTranscriptionHelper.startLiveTranscription();
  await zoom.liveTranscriptionHelper.enableReceiveSpokenLanguageContent(true);
}, [zoom, connected, log]);

// Listeners, registrados antes de joinSession:
zoom.addListener(EventType.onOriginalLanguageMsgReceived, (payload) => {
  setMessages((current) => [...current, { ...payload, origin: "original" }]);
  zoomSpikeService.postTranscript(payload); // POST /transcript
});
zoom.addListener(EventType.onLiveTranscriptionMsgInfoReceived, (payload) => {
  setMessages((current) => [...current, { ...payload, origin: "transcription" }]);
  zoomSpikeService.postTranscript(payload);
});
```

### Servidor — `/transcript` (`server/index.js`)

```js
app.post("/transcript", async (req, res) => {
  const { messageID, messageContent, speakerName, speakerID, timeStamp, messageType } = req.body ?? {};
  const linha = { messageID, messageContent, speakerName, speakerID, timeStamp, messageType,
    recebidoEm: new Date().toISOString() };
  await appendFile(TRANSCRIPT_FILE, JSON.stringify(linha) + "\n", "utf8");
  res.json({ ok: true });
});
```

## Exemplo de `transcripts.jsonl`

**Importante**: estas 5 linhas foram geradas com `curl` direto no endpoint, para comprovar que
o servidor grava corretamente — **não são transcrição real de fala**, isso ainda está pendente
(T5).

```json
{"messageID":"m1","messageContent":"Olá mundo","speakerName":"Safira","speakerID":"u1","timeStamp":"123","messageType":1,"recebidoEm":"2026-10-11T20:54:14.327Z"}
{"messageID":"m2","messageContent":"Bom dia, conseguem me ouvir?","speakerName":"Safira","speakerID":"u1","timeStamp":"124","messageType":0,"recebidoEm":"2026-10-11T20:54:37.744Z"}
{"messageID":"m3","messageContent":"Vou trocar a câmera agora","speakerName":"Safira","speakerID":"u1","timeStamp":"125","messageType":0,"recebidoEm":"2026-10-11T20:54:37.753Z"}
{"messageID":"m4","messageContent":"Testando o microfone do celular","speakerName":"Participante Web","speakerID":"u2","timeStamp":"126","messageType":0,"recebidoEm":"2026-10-11T20:54:37.760Z"}
{"messageID":"m5","messageContent":"Última frase deste teste de transcrição","speakerName":"Safira","speakerID":"u1","timeStamp":"127","messageType":1,"recebidoEm":"2026-10-11T20:54:37.769Z"}
```

## Conclusões sobre as 3 perguntas do objetivo

1. **O SDK roda no Expo Go ou exige development build?**
   **Exige development build — confirmado em device real (T1), e o development build
   confirmado funcional via EAS Build (T2)** depois de 4 correções reais (ver "Bugs reais"
   #1–#4): `minSdkVersion`, script de build ignorado pelo pnpm, crash de
   `autoAdjustSpeakerVolume`, e permissão de câmera em runtime. Sem Android SDK/JDK/Xcode em
   nenhuma máquina do spike, o caminho viável para desenvolvimento (não só este teste) é EAS
   Build — o que tem custo de tempo (builds na nuvem, minutos por iteração nativa) a considerar
   no planejamento, embora iteração de JS puro continue instantânea via `expo start --dev-client`.
   **Ressalva importante**: "roda" não significa "está estável" — ver bug #5. O vídeo trava
   de forma intermitente e não determinística, às vezes depois de minutos de uso normal, sem
   um gatilho único identificado.

2. **A troca de câmera frontal/traseira funciona durante a chamada?**
   **Sim, mas sem confiabilidade suficiente para afirmar que "funciona".** `switchCamera()` já
   trocou de lente com sucesso (observado duas vezes seguidas, sem travar, num dos testes), e
   em outros testes travou. O vídeo da câmera traseira também renderiza deitado (a correção de
   orientação só foi aplicada para a frontal, no join). O bloqueio aqui não é a API — a API
   funciona quando o SDK não trava — é a instabilidade geral do bug #5, que faz qualquer
   teste de duração mais longa (necessário para T3/T4 completos, com segunda ponta) não
   confiável no estado atual.

3. **A transcrição ao vivo funciona no celular e o texto chega a um backend?**
   **Backend: sim, confirmado.** `/transcript` grava corretamente (testado com `curl`). **Fluxo
   de voz: não — bloqueado pela conta, não por código.** `canStartLiveTranscription()` retorna
   `false` de forma consistente; a documentação da Zoom confirma que é um add-on pago que
   precisa ser contratado. Não é algo que se resolve no código.

## Pendências

- [x] T1 — Expo Go, erro real coletado.
- [x] T2 — development build via EAS, 4 bugs reais encontrados e corrigidos; build final
      `finished`.
- [x] Confirmar a correção de permissão de câmera (bug #4) — confirmado, câmera liga.
- [x] **Bug #6 (orientação, câmera frontal)**: resolvido com `rotateMyVideo(0)` no join —
      confirmado em device.
- [x] T5 (parte da conta) — confirmado que `canStartLiveTranscription` é bloqueio de add-on,
      não de código.
- [ ] **Bug #5 (bloqueador real)**: travamento (ANR) **intermitente e não determinístico** no
      vídeo — já aconteceu na troca para a traseira, num reload do Metro com sessão ativa, e
      na própria câmera frontal depois de ter funcionado bem por vários minutos. Não é mais
      "trocar pra traseira trava" — é instabilidade geral. Causa raiz não identificada sem
      logcat real (`adb logcat` no momento do travamento) — nenhuma máquina envolvida neste
      spike tem `adb` instalado. Tentativas de correção via `rotateMyVideo` já causaram duas
      regressões (tela preta); não recomendo mais tentativas de código sem dados de logcat.
- [ ] **Orientação da câmera traseira**: ainda deitada (correção aplicada só cobre a
      frontal, no join). Depende de resolver o bug #5 primeiro para testar valores de rotação
      na traseira sem o risco de causar tela preta.
- [ ] T3 (segunda ponta), T6 (anfitrião vs. participante) — ainda não testados; o bug #5
      torna esses testes pouco confiáveis no momento (a chamada pode cair no meio).
- [x] **Comercial da Zoom**: confirmado que "Live Transcription" é add-on pago não habilitado
      nesta conta — falta decidir se vale contratar, e por qual custo (não pesquisado aqui).
- [ ] Decidir se o fluxo de desenvolvimento real do time vai depender de EAS Build (sem
      Android SDK/JDK local) ou se alguém vai configurar o ambiente nativo local — isso muda o
      tempo de iteração em qualquer mudança nativa futura, não só deste spike.
- [ ] Considerar reportar os bugs #5 e #6 ao suporte da Zoom (devforum ou ticket), já que
      ambos têm relatos de outros desenvolvedores sem solução oficial — pode ser um limite real
      do SDK em determinados devices/condições, não algo que dê para resolver só no nosso
      código.
