<div align="center">

<div align="center">
  <img src="https://i.postimg.cc/3NwxbY1L/logo-(1).png" alt="StreamWonder Banner" height="300" />
</div>

**Uma plataforma de streaming educacional para filmes, séries, animes, doramas, HQs e canais ao vivo**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## ⚠️ **Aviso Importante**

> **Este projeto é exclusivamente para fins educacionais e de estudo.**
>
> - Não armazenamos nenhum arquivo de vídeo ou conteúdo em nossos servidores
> - Todo o conteúdo é fornecido por APIs públicas de terceiros
> - Este projeto não tem fins comerciais ou lucrativos
> - Os direitos autorais de filmes, séries e demais conteúdos pertencem aos seus respectivos proprietários
> - Utilize este projeto apenas para aprendizado e desenvolvimento de habilidades técnicas

## 📋 Sobre o Projeto

StreamWonder é uma aplicação web desenvolvida como estudo prático de tecnologias modernas, demonstrando a integração com múltiplas APIs para criar uma plataforma de streaming completa. O projeto foi construído com foco em:

- ✅ **Aprendizado de Next.js 15** e suas features mais recentes
- ✅ **Integração com APIs REST** (TMDb, Comic Vine, WarezCdn)
- ✅ **Desenvolvimento responsivo** e mobile-first
- ✅ **Práticas modernas de UI/UX** com Tailwind CSS
- ✅ **Gerenciamento de estado** e hooks do React
- ✅ **Performance e otimizações** de carregamento

## 🚀 Funcionalidades

| Módulo | Descrição | APIs Utilizadas |
|--------|-----------|-----------------|
| 🎬 **Filmes** | Catálogo de filmes com busca e filtros | TMDb API |
| 📺 **Séries** | Séries de TV com informações detalhadas | TMDb API |
| 🇰🇷 **Doramas** | Doramas coreanos exclusivos | TMDb API |
| 🇯🇵 **Animes** | Animes japoneses | TMDb API |
| 📚 **HQs** | Histórias em quadrinhos | Comic Vine API |
| 📡 **Canais ao Vivo** | Transmissão de canais de TV | WarezCdn API |

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Lucide React** - Ícones modernos

### APIs Integradas
- **TMDb API** - Dados de filmes, séries e animes
- **Comic Vine API** - Dados de HQs e quadrinhos
- **WarezCdn API** - Streaming de vídeos e canais

### Ferramentas de Desenvolvimento
- **ESLint** - Análise de código
- **Prettier** - Formatação de código
- **Git** - Controle de versão

## 📦 Instalação e Execução

### Pré-requisitos

- Node.js 18+ ou Bun
- NPM, Yarn, PNPM ou Bun

### Passos para executar

1. **Clone o repositório**
```bash
git clone https://github.com/Perdigao-wander/streamwonder.git
cd streamwonder
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
# ou
pnpm install
# ou
bun install
```
## 3. Configure as variáveis de ambiente

Crie um arquivo chamado `.env.local` na raiz do projeto e adicione as seguintes variáveis:

```env
# TMDb API
NEXT_PUBLIC_SERVER_API_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_API_KEY=YOUR_TMDB_API_KEY
NEXT_PUBLIC_SESSION_ID=YOUR_SESSION_ID
NEXT_PUBLIC_ACCOUNT_ID=YOUR_ACCOUNT_ID
NEXT_PUBLIC_API_TOKEN=YOUR_API_TOKEN

# WarezCdn API
NEXT_PUBLIC_WAREZCDN_API=https://warezcdn.site/lista

# Comic Vine API
NEXT_PUBLIC_COMIC_VINE_API_KEY=YOUR_COMIC_VINE_API_KEY
NEXT_PUBLIC_COMIC_VINE_API_URL=https://comicvine.gamespot.com/api
```
4. **Execute o servidor de desenvolvimento**
 ```bash 
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
 ``` 
5. **Acesse a aplicação**
- Abra http://localhost:3000
- Explore as funcionalidades

## 📁 Estrutura do Projeto

```bash
streamwonder/
├── app/
│   ├── api/                        # Rotas da API (App Router)
│   │   ├── movies/                 # Endpoints de filmes
│   │   ├── tv/                     # Endpoints de séries
│   │   ├── comics/                 # Endpoints de HQs
│   │   └── channels/               # Endpoints de canais ao vivo
│   │
│   ├── components/                 # Componentes reutilizáveis da interface
│   │
│   ├── movies/                     # Página de filmes
│   ├── series/                     # Página de séries
│   ├── doramas/                    # Página de doramas
│   ├── animes/                     # Página de animes
│   ├── hqs/                        # Página de histórias em quadrinhos
│   ├── canais/                     # Página de canais ao vivo
│   │
│   ├── layout.tsx                  # Layout global da aplicação
│   ├── globals.css                 # Estilos globais
│   └── page.tsx                    # Página inicial
│
├── public/                         # Arquivos públicos e estáticos
├── types/                          # Tipagens TypeScript
├── utils/                          # Funções auxiliares e utilitários
├── hooks/                          # Hooks customizados do React
├── services/                       # Integrações e chamadas para APIs
├── constants/                      # Constantes globais
├── .env.local                      # Variáveis de ambiente
├── next.config.ts                  # Configuração do Next.js
├── tailwind.config.ts              # Configuração do Tailwind CSS
├── tsconfig.json                   # Configuração do TypeScript
└── package.json                    # Dependências e scripts do projeto
```

# 🎯 Aprendizados e Desafios

Durante o desenvolvimento do **StreamWonder**, foram explorados diversos conceitos modernos do ecossistema React e Next.js, com foco em performance, escalabilidade e experiência do usuário.

## Principais aprendizados

- ✅ Implementação de **rotas dinâmicas** no Next.js 15 utilizando App Router
- ✅ Consumo de múltiplas APIs REST com tratamento de erros e estratégias de fallback
- ✅ Organização de componentes reutilizáveis e arquitetura escalável
- ✅ Gerenciamento de estado e fluxo de dados em aplicações React
- ✅ Criação de interfaces responsivas com abordagem mobile-first
- ✅ Otimização de carregamento e renderização de conteúdo
- ✅ Estruturação de um design system consistente com Tailwind CSS
- ✅ Integração de players de vídeo com foco em segurança e usabilidade
- ✅ Filtragem de conteúdo adulto em múltiplas camadas da aplicação
- ✅ Implementação de carrosséis responsivos com suporte a gestos touch em dispositivos móveis

## Desafios encontrados

- ⚡ Gerenciar requisições simultâneas para diferentes APIs externas
- ⚡ Padronizar dados vindos de múltiplas fontes
- ⚡ Evitar problemas de hidratação no Next.js
- ⚡ Melhorar a experiência do usuário em conexões lentas
- ⚡ Manter boa performance mesmo com grande volume de conteúdo
- ⚡ Garantir compatibilidade entre desktop e dispositivos móveis

# Contribuição🤝
Este é um projeto educacional, mas contribuições são bem-vindas!

Faça um Fork do projeto

Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)

Commit suas mudanças (git commit -m 'Add some AmazingFeature')

Push para a branch (git push origin feature/AmazingFeature)

Abra um Pull Request

# 📝 Licença

Este projeto está licenciado sob a licença **MIT**.

Consulte o arquivo `LICENSE` para mais informações sobre permissões, limitações e condições de uso.


# 🙏 Agradecimentos

Agradecimentos especiais às plataformas e ferramentas que contribuíram para o desenvolvimento deste projeto:

- **TMDb** — Pelo extenso banco de dados de filmes, séries e conteúdos multimídia
- **Comic Vine** — Pela API de histórias em quadrinhos e personagens
- **WarezCdn** — Pela integração de conteúdos e transmissões
- **Vercel** — Pela hospedagem, performance e excelente documentação do ecossistema Next.js


# 📧 Contato

Caso tenha dúvidas, sugestões ou queira contribuir com melhorias para o projeto, fique à vontade para abrir uma **Issue** no repositório.

> Este projeto é mantido exclusivamente para fins educacionais e de estudo.

---
<div align="center"> <sub>Built with ❤️ for learning and study purposes</sub> <br /> <sub>© 2026 StreamWonder - Projeto Educacional</sub> </div>