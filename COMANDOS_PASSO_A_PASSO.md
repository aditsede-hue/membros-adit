# 📋 Guia de Comandos - Portal de Consulta de Membros ADIT

## ⚙️ INSTALAÇÃO INICIAL

### Passo 1: Instalar Git
**Windows:**
- Baixe em: https://git-scm.com/download/win
- Execute o instalador e siga as instruções

**Mac:**
```bash
brew install git
```

**Linux:**
```bash
sudo apt-get install git
```

### Passo 2: Configurar Git (primeira vez)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@gmail.com"
```

---

## 🔧 COMANDOS BÁSICOS DO GIT

### Ver status do repositório
```bash
cd /home/ubuntu/member-portal
git status
```

### Ver histórico de commits
```bash
git log --oneline
```

### Ver todas as mudanças feitas
```bash
git diff
```

### Ver mudanças de um arquivo específico
```bash
git diff index.html
```

---

## 📝 EDITAR ARQUIVOS E FAZER COMMIT

### Passo 1: Editar um arquivo
Use seu editor de texto favorito para editar qualquer arquivo (index.html, etc)

### Passo 2: Ver o que foi mudado
```bash
cd /home/ubuntu/member-portal
git status
```

### Passo 3: Adicionar as mudanças ao git
```bash
# Adicionar um arquivo específico
git add index.html

# Adicionar todos os arquivos modificados
git add .
```

### Passo 4: Fazer commit (salvar as mudanças)
```bash
git commit -m "Descrição das mudanças"
```

**Exemplos de mensagens boas:**
```bash
git commit -m "Corrigir cargo dos membros"
git commit -m "Adicionar novo card ao dashboard"
git commit -m "Atualizar cores dos cards"
git commit -m "Melhorar responsividade mobile"
```

### Passo 5: Enviar para GitHub (após conectar)
```bash
git push origin main
```

---

## 🌐 CONECTAR AO GITHUB

### Passo 1: Criar repositório no GitHub
1. Acesse https://github.com/new
2. Nome: `member-portal-adit`
3. Descrição: `Portal de Consulta de Membros - Igreja ADIT`
4. Selecione "Public"
5. Clique em "Create repository"

### Passo 2: Adicionar repositório remoto
```bash
cd /home/ubuntu/member-portal
git remote add origin https://github.com/SEU_USERNAME/member-portal-adit.git
```

**Substitua `SEU_USERNAME` pelo seu username do GitHub**

### Passo 3: Renomear branch para main
```bash
git branch -M main
```

### Passo 4: Enviar código para GitHub
```bash
git push -u origin main
```

### Passo 5: Verificar se funcionou
Acesse: https://github.com/SEU_USERNAME/member-portal-adit

---

## 🚀 DEPLOY NA VERCEL

### Passo 1: Criar conta Vercel
1. Acesse https://vercel.com
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize Vercel a acessar sua conta GitHub

### Passo 2: Fazer deploy
1. Na dashboard Vercel, clique em "Add New..."
2. Selecione "Project"
3. Clique em "Import Git Repository"
4. Selecione `member-portal-adit`
5. Clique em "Import"
6. Deixe as configurações padrão
7. Clique em "Deploy"

### Passo 3: Aguardar deployment
- Vercel fará o deploy automaticamente
- Você receberá um link como: `https://member-portal-adit.vercel.app`

### Passo 4: Atualizações automáticas
Toda vez que você fizer `git push`, Vercel atualiza automaticamente!

---

## 📱 GITHUB PAGES (Alternativa)

### Passo 1: Ativar GitHub Pages
1. Acesse https://github.com/SEU_USERNAME/member-portal-adit
2. Clique em "Settings"
3. Vá para "Pages" (menu esquerdo)
4. Em "Source", selecione "Deploy from a branch"
5. Selecione "main" e "/ (root)"
6. Clique em "Save"

### Passo 2: Aguardar
- GitHub Pages fará o deploy automaticamente
- Seu site estará em: `https://SEU_USERNAME.github.io/member-portal-adit`

---

## 🔄 FLUXO COMPLETO DE ATUALIZAÇÃO

### Quando você quer fazer mudanças no site:

```bash
# 1. Entre na pasta do projeto
cd /home/ubuntu/member-portal

# 2. Veja o status
git status

# 3. Edite os arquivos que precisa (use um editor de texto)
# Exemplo: editar index.html, members_data.json, etc

# 4. Veja as mudanças
git status

# 5. Adicione as mudanças
git add .

# 6. Faça commit
git commit -m "Descrição do que você mudou"

# 7. Envie para GitHub
git push origin main

# 8. Vercel atualiza automaticamente!
# Seu site estará atualizado em poucos segundos
```

---

## 🆘 COMANDOS DE EMERGÊNCIA

### Desfazer última mudança (antes de fazer commit)
```bash
git checkout -- index.html
```

### Desfazer último commit (mantém as mudanças)
```bash
git reset --soft HEAD~1
```

### Ver commits anteriores
```bash
git log --oneline
```

### Voltar para um commit anterior
```bash
git checkout HASH_DO_COMMIT
```

**Exemplo:**
```bash
git log --oneline
# Você vê: 7ecf5de Initial commit
git checkout 7ecf5de
```

### Voltar ao commit mais recente
```bash
git checkout main
```

---

## 🔑 USANDO SSH (Mais Seguro)

### Gerar chave SSH
```bash
ssh-keygen -t ed25519 -C "seu.email@gmail.com"
```

### Copiar chave pública
```bash
cat ~/.ssh/id_ed25519.pub
```

### Adicionar chave no GitHub
1. Acesse https://github.com/settings/keys
2. Clique em "New SSH key"
3. Cole a chave
4. Clique em "Add SSH key"

### Usar SSH em vez de HTTPS
```bash
git remote set-url origin git@github.com:SEU_USERNAME/member-portal-adit.git
```

---

## 📊 COMANDOS ÚTEIS DO GIT

### Ver quem fez cada mudança
```bash
git blame index.html
```

### Ver mudanças de um commit específico
```bash
git show HASH_DO_COMMIT
```

### Criar uma branch (cópia do projeto)
```bash
git checkout -b minha-feature
```

### Voltar para a branch main
```bash
git checkout main
```

### Listar todas as branches
```bash
git branch -a
```

### Deletar uma branch
```bash
git branch -d minha-feature
```

---

## 🎯 CHECKLIST PARA DEPLOY INICIAL

- [ ] Instalar Git
- [ ] Configurar Git (nome e email)
- [ ] Criar conta GitHub
- [ ] Criar repositório no GitHub
- [ ] Adicionar remote: `git remote add origin ...`
- [ ] Fazer push: `git push -u origin main`
- [ ] Criar conta Vercel
- [ ] Conectar GitHub à Vercel
- [ ] Fazer deploy do repositório
- [ ] Testar o site em: `https://member-portal-adit.vercel.app`
- [ ] ✅ Pronto! Site permanente online!

---

## 📞 SUPORTE

Se tiver dúvidas sobre os comandos, você pode:

1. Ver ajuda de um comando:
```bash
git help commit
```

2. Ver documentação oficial:
https://git-scm.com/doc

3. Contatar a equipe de desenvolvimento

---

**Criado em:** 2026-03-11
**Versão:** 1.0
**Última atualização:** 2026-03-11
