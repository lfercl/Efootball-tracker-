# eFootball Tracker — iPhone e Android

Esta versão é uma web app responsiva/PWA e funciona no Chrome, Safari, iPhone e Android.

## Grupos partilhados
Os dados partilhados usam Firebase Firestore. O nome e o grupo atual do jogador ficam no próprio dispositivo.

## Acesso ao grupo (novo fluxo)
- O grupo continua com link de convite (`?group=CODIGO`).
- Ao abrir o link, o utilizador cria o próprio `nome de utilizador` e `senha` na primeira entrada.
- Nas próximas entradas, usa os mesmos dados para autenticar no grupo.
- O primeiro utilizador registado no grupo vira administrador do grupo.

## Regras de resultados
- Somente administrador pode apagar resultados.
- Resultado apagado vai para uma lixeira interna e pode ser recuperado pelo administrador.
- Ao registar resultado, o jogador logado fica fixo; apenas o adversário é selecionável.

## Configuração
1. Crie um projeto no Firebase.
2. Ative o Firestore Database.
3. Ative o Cloud Messaging no Firebase.
4. Registe uma Web App no projeto Firebase.
5. Copie `.env.example` para `.env`.
6. Preencha as variáveis `VITE_FIREBASE_*` com a configuração da Web App.
6.1. No Firebase Console, na seção Cloud Messaging, copie a chave pública VAPID para `VITE_FIREBASE_VAPID_KEY`.
7. Aplique as regras de `firestore.rules`.
8. Execute `npm install` e `npm run build`.
9. Publique o projeto numa hospedagem compatível com Vite ou use `firebase deploy` para hosting/functions.

### App instalável (Android / iPhone)
Este projeto agora funciona como um PWA. Para aproveitar como um app nativo:
- Publique o site em HTTPS.
- No Android, abra o site no Chrome e escolha "Instalar" ou use o botão de instalação.
- No iPhone, abra o site no Safari e use "Adicionar à Tela de Início".

### Funções Firebase
O app grava tokens de push em Firestore. Para enviar notificações quando um resultado é registrado, use as Cloud Functions em `functions/`.
7. Execute `npm install` e `npm run build`.
8. Publique o projeto numa hospedagem compatível com Vite.

## Importante
As regras incluídas permitem leitura e escrita pública para manter o fluxo por código de grupo sem login. Para uma app pública em produção, recomenda-se adicionar Firebase Authentication e regras mais restritas.

## Publicar na Apple App Store (iPhone)
Este projeto já está preparado com Capacitor e plataforma iOS.

### Comandos do projeto
- `npm run ios:add` cria a pasta nativa iOS (`ios/`) (uma vez só).
- `npm run ios:sync` gera build web e sincroniza no projeto iOS.
- `npm run ios:open` abre o projeto no Xcode.

### Passos para publicação
1. Em um Mac com Xcode instalado, abra o projeto.
2. Execute `npm install`.
3. Execute `npm run ios:sync`.
4. Execute `npm run ios:open`.
5. No Xcode, configure Signing & Capabilities com sua conta Apple Developer.
6. Defina `Bundle Identifier` único e ajuste versão/build.
7. Faça Archive e envie para App Store Connect.
8. No App Store Connect, preencha metadata, screenshots, privacidade e envie para revisão.

### Observação
Conta Ionic não é obrigatória para publicar com Capacitor; para App Store você precisa da conta Apple Developer ativa.

### Publicação sem Mac local
Você pode usar CI com GitHub Actions (runner macOS) para gerar e enviar para TestFlight.
Passo a passo em [APP_STORE_CONNECT_STEPS.md](APP_STORE_CONNECT_STEPS.md).
