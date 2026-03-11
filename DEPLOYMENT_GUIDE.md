# 🚀 Guia de Deployment - Portal de Consulta de Membros ADIT

## Opção 1: Deploy com Vercel (RECOMENDADO - Mais Fácil)

### Passo 1: Criar Conta no GitHub
1. Acesse https://github.com
2. Clique em "Sign up"
3. Preencha os dados (email, senha, username)
4. Confirme o email

### Passo 2: Criar Repositório no GitHub
1. Acesse https://github.com/new
2. Nome do repositório: `member-portal-adit`
3. Descrição: `Portal de Consulta de Membros - Igreja ADIT`
4. Selecione "Public"
5. Clique em "Create repository"

### Passo 3: Fazer Push do Código para GitHub
```bash
cd /home/ubuntu/member-portal
git remote add origin https://github.com/SEU_USERNAME/member-portal-adit.git
git branch -M main
git push -u origin main
```

### Passo 4: Deploy na Vercel
1. Acesse https://vercel.com
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize a Vercel a acessar sua conta GitHub
5. Clique em "Import Project"
6. Selecione o repositório `member-portal-adit`
7. Clique em "Import"
8. Vercel fará o deploy automaticamente!

### Resultado:
- **URL Permanente:** `https://member-portal-adit.vercel.app`
- **Atualizações Automáticas:** Toda vez que você fizer push no GitHub, a Vercel atualiza automaticamente

---

## Opção 2: Deploy com GitHub Pages

### Passo 1-2: Mesmo que acima

### Passo 3: Fazer Push do Código para GitHub
```bash
cd /home/ubuntu/member-portal
git remote add origin https://github.com/SEU_USERNAME/member-portal-adit.git
git branch -M main
git push -u origin main
```

### Passo 4: Ativar GitHub Pages
1. Vá para https://github.com/SEU_USERNAME/member-portal-adit
2. Clique em "Settings"
3. Vá para "Pages" (menu esquerdo)
4. Em "Source", selecione "Deploy from a branch"
5. Selecione "main" e "/ (root)"
6. Clique em "Save"

### Resultado:
- **URL Permanente:** `https://SEU_USERNAME.github.io/member-portal-adit`

---

## Opção 3: Usar seu Próprio Domínio

### Com Vercel:
1. Faça o deploy na Vercel (Opção 1)
2. Vá para as configurações do projeto na Vercel
3. Clique em "Domains"
4. Adicione seu domínio (ex: portal-membros.com.br)
5. Siga as instruções para apontar o domínio

### Com GitHub Pages:
1. Faça o deploy no GitHub Pages (Opção 2)
2. Vá para Settings > Pages
3. Em "Custom domain", adicione seu domínio
4. Siga as instruções para apontar o domínio

---

## Comandos Úteis

### Atualizar o site após fazer mudanças:
```bash
cd /home/ubuntu/member-portal
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

### Ver histórico de commits:
```bash
git log --oneline
```

### Ver status do repositório:
```bash
git status
```

---

## Suporte

Se tiver dúvidas, entre em contato com a equipe de desenvolvimento.

**Criado em:** 2026-03-11
**Versão:** 1.0
