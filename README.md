# eFootball Tracker — iPhone e Android

Esta versão é uma web app responsiva/PWA e funciona no Chrome, Safari, iPhone e Android.

## Grupos partilhados
Os dados partilhados usam Firebase Firestore. O nome e o grupo atual do jogador ficam no próprio dispositivo.

## Configuração
1. Crie um projeto no Firebase.
2. Ative o Firestore Database.
3. Registe uma Web App no projeto Firebase.
4. Copie `.env.example` para `.env`.
5. Preencha as variáveis `VITE_FIREBASE_*` com a configuração da Web App.
6. Aplique as regras de `firestore.rules`.
7. Execute `npm install` e `npm run build`.
8. Publique o projeto numa hospedagem compatível com Vite.

## Importante
As regras incluídas permitem leitura e escrita pública para manter o fluxo por código de grupo sem login. Para uma app pública em produção, recomenda-se adicionar Firebase Authentication e regras mais restritas.
