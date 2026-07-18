# Publicar iOS Sem Mac Local (GitHub Actions)

Este projeto já está preparado para gerar e enviar build iOS via GitHub Actions.

## 1. Pré-requisitos

1. Conta Apple Developer ativa.
2. App criado no App Store Connect com Bundle ID igual ao app.
3. Certificado iOS Distribution (.p12) e provisioning profile App Store.
4. Chave API do App Store Connect (Key ID, Issuer ID, arquivo .p8).

## 2. Secrets no GitHub

No repositório GitHub, abra Settings -> Secrets and variables -> Actions e crie:

1. APPLE_APP_IDENTIFIER
2. APPLE_TEAM_ID
3. IOS_PROFILE_NAME
4. IOS_CERTIFICATE_P12_BASE64
5. IOS_CERTIFICATE_PASSWORD
6. IOS_PROVISIONING_PROFILE_BASE64
7. KEYCHAIN_PASSWORD
8. APPLE_API_KEY_ID
9. APPLE_API_ISSUER_ID
10. APPLE_API_PRIVATE_KEY

### Como converter para base64

No terminal local:

```bash
base64 -i cert.p12 | pbcopy
base64 -i profile.mobileprovision | pbcopy
```

Cole o resultado nos secrets `IOS_CERTIFICATE_P12_BASE64` e `IOS_PROVISIONING_PROFILE_BASE64`.

Para `APPLE_API_PRIVATE_KEY`, cole o conteúdo completo do arquivo `.p8`.

## 3. Rodar pipeline

1. Vá em Actions no GitHub.
2. Abra workflow iOS TestFlight.
3. Clique em Run workflow.
4. Opcional: preencha as notas da release.
5. Aguarde build + upload para TestFlight.

## 4. Depois do upload

1. Abra App Store Connect no iPhone.
2. Vá em TestFlight e confirme a build.
3. Preencha metadados da versão (descrição, screenshots, privacidade).
4. Envie para revisão.

## 5. Erros comuns

1. Bundle ID divergente: alinhar `APPLE_APP_IDENTIFIER` com App Store Connect.
2. Profile inválido: gerar profile App Store novo para o Bundle ID correto.
3. Certificado expirado: criar novo certificado e atualizar os secrets.
4. API key inválida: revisar Key ID, Issuer ID e conteúdo do `.p8`.