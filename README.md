# Flint 🔥

> **Sua produtividade, organizada.**

O **Flint** é um aplicativo de notas multiplataforma (**Android, iOS e Web**) desenvolvido com foco em simplicidade, velocidade e eficiência.  
Construído com **React Native** e **Expo**, oferece uma experiência contínua entre dispositivos, com **sincronização em tempo real via Firebase**.

---

## 📱 Funcionalidades

- 🔐 **Autenticação Segura**  
  Login e cadastro via **E-mail/Senha** utilizando Firebase Authentication.

- 📝 **Criação de Notas**  
  Suporte completo à escrita em **Markdown**.

- 🗂️ **Organização Inteligente**  
  Sistema de **Arquivar** e **Lixeira**, com ações por **gestos (Swipe)**.

- 🌍 **Cross-Platform**
  - **Mobile:** Interface nativa, fluida e responsiva.
  - **Web:** Layout otimizado para Desktop (estilo SaaS) + suporte a **PWA**.

- 🌙 **Modo Escuro**  
  Tema **Enterprise Dark** nativo e consistente em todas as plataformas.

- 💾 **Persistência Híbrida**
  - Mobile: `AsyncStorage`
  - Web: `LocalStorage`

---

## 🛠️ Tech Stack

- **Core:** React Native + Expo SDK 52  
- **Linguagem:** TypeScript  
- **Navegação:** Expo Router  
- **Backend & Banco de Dados:** Firebase (Firestore + Authentication)  
- **Estilização:** StyleSheet nativo, com adaptações condicionais para Web  
- **Deploy:**
  - Web: **Vercel**
  - Mobile: **EAS Build (Android / iOS)**

---

## 🚀 Como Rodar o Projeto

### ✅ Pré-requisitos

Certifique-se de ter instalado:

- Node.js (LTS)
- Git
- Expo Go (para testes em dispositivos móveis)

---

### 📦 Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/flint.git
   cd flint
````

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure o Firebase:

   * O projeto já possui o arquivo `firebaseConfig.ts` (ou `.js`).
   * Verifique se as chaves de API estão corretas.

---

### ▶️ Executando Localmente

Inicie o servidor de desenvolvimento:

```bash
npx expo start
```

* **Web:** pressione `w` no terminal
* **Mobile:** escaneie o QR Code com o app **Expo Go** (Android ou iOS)

---

## 🌐 Deploy Web (Vercel)

O Flint pode ser exportado como um site estático (SPA).

1. Gere a build de produção:

   ```bash
   npx expo export --clear
   ```

2. Faça o deploy da pasta `dist`:

   ```bash
   npx vercel deploy dist --prod
   ```

> ℹ️ O arquivo `vercel.json` garante o funcionamento correto do roteamento SPA ao atualizar páginas.

---

## 📱 Gerar APK (Android)

Para gerar um APK instalável sem passar pela Play Store:

```bash
# Requer conta na Expo e EAS CLI instalado
eas build -p android --profile preview
```

---

## 📂 Estrutura de Pastas

```txt
/app          → Telas e rotas (Expo Router)
/components   → Componentes reutilizáveis
/services     → Integrações com Firebase (Auth e Firestore)
/assets       → Imagens, ícones e fontes
```

---

## ❤️ Considerações Finais

O **Flint** foi criado para ser rápido, elegante e confiável — um verdadeiro **second brain** para o dia a dia.

Desenvolvido com 🧡 e **React Native**.

```

---