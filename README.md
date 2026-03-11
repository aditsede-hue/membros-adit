# Portal de Consulta de Membros

Um portal web moderno e responsivo para consulta de cadastro de membros da igreja.

## 📋 Características

- **Dashboard com indicadores** - Total de membros, membros ativos, congregações e registros que precisam atualização
- **Busca avançada** - Busque por nome ou matrícula do membro
- **Informações detalhadas** - Exibe dados completos do membro incluindo:
  - Matrícula
  - Congregação
  - Cargo/Ministério
  - Data de Nascimento (com cálculo automático de idade)
  - Telefone
  - Endereço
- **Design responsivo** - Funciona perfeitamente em desktop, tablet e mobile
- **Privacidade** - Exibe apenas dados básicos, sem informações sensíveis

## 🚀 Como Usar Localmente

1. Abra o arquivo `index.html` em um navegador web
2. Digite o nome ou matrícula do membro no campo de busca
3. Clique em "Buscar" ou pressione Enter
4. Os dados do membro serão exibidos

## 📁 Estrutura de Arquivos

```
member-portal/
├── index.html              # Página principal (HTML + CSS + JavaScript)
├── src/
│   └── members_data.json   # Dados dos membros em formato JSON
└── README.md              # Este arquivo
```

## 🔗 Dados dos Membros

Os dados são carregados do arquivo `src/members_data.json` que contém informações de 176 membros cadastrados.

## 🌐 Deployment Permanente

### Opção 1: GitHub Pages (Recomendado - Gratuito)

1. Crie um repositório no GitHub chamado `member-portal`
2. Faça upload dos arquivos do projeto
3. Vá para Settings → Pages
4. Selecione "Deploy from a branch" e escolha `main` branch
5. Seu portal estará disponível em: `https://seu-usuario.github.io/member-portal`

### Opção 2: Netlify (Gratuito)

1. Acesse https://netlify.com
2. Clique em "New site from Git"
3. Conecte seu repositório GitHub
4. Configure a build (não precisa, é apenas HTML/CSS/JS)
5. Deploy automático realizado
6. Seu portal terá um URL permanente

### Opção 3: Seu Próprio Servidor

Para hospedar em um servidor próprio:

```bash
# Copie os arquivos para seu servidor
scp -r member-portal/* seu-servidor:/var/www/html/member-portal/

# Configure um servidor web (nginx ou Apache)
# E aponte para a pasta do projeto
```

### Opção 4: Vercel (Gratuito)

1. Acesse https://vercel.com
2. Importe seu repositório GitHub
3. Deploy automático
4. URL permanente fornecido

## 📝 Notas

- Os dados dos membros são carregados do arquivo JSON e processados no navegador
- Nenhum dado é enviado para servidores externos
- O portal é totalmente funcional offline após o carregamento inicial

## 🔐 Privacidade

Este portal exibe apenas informações básicas dos membros e não inclui dados sensíveis como documentos de identidade ou informações bancárias.

## 📞 Suporte

Para atualizações dos dados de membros, edite o arquivo `src/members_data.json` com as novas informações.

---

**Desenvolvido para a Secretaria da Igreja**
