# Gerenciador de Notas

O **Gerenciador de Notas** é uma aplicação full-stack que permite que usuários autenticados criem, leiam, atualizem e excluam suas próprias notas. A aplicação utiliza autenticação via JWT para proteger as rotas e garantir que cada usuário só possa acessar suas próprias informações.

## Front-end
O front-end pode ser encontrado nesse repositório:
[https://github.com/caiovalverde20/gerenciador-de-notas-frontend](https://github.com/caiovalverde20/gerenciador-de-notas-frontend)

## Tecnologias Utilizadas

- **NestJS** – Framework para construção do backend
- **MongoDB** – Banco de dados NoSQL (utilizando Mongoose)
- **Swagger** – Documentação interativa da API
- **Docker** – Facilita o deploy e o desenvolvimento local

## Deploy

A aplicação está disponível no Render:

[https://notas-backend-wa1c.onrender.com](https://notas-backend-wa1c.onrender.com)

A documentação Swagger pode ser acessada em:

[https://notas-backend-wa1c.onrender.com/docs](https://notas-backend-wa1c.onrender.com/docs)

## Variáveis de Ambiente

O projeto foi feito de forma que o .env seja opcional, apenas o MongoURI se não estiver utilizando Docker.
O backend possui as seguintes variáveis de ambiente:

- **MONGO_URI**: Exemplo de string de conexão para o MongoDB Atlas:
  ```
  mongodb+srv://user:<password>@cluster0.cqirz.mongodb.net/prod?retryWrites=true&w=majority
  ```
- **JWT_SECRET**: Chave secreta para geração e validação de JWT (ex.: `secret`).
- **PORT**: Porta em que a aplicação irá escutar (Render define automaticamente, mas pode ser, por exemplo, `3000`).
- **NODE_OPTIONS**: Opcional, para aumentar o limite de memória, por exemplo:
  ```
  --max_old_space_size=512
  ```

## Como Executar o Projeto

### Com Docker

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/gerenciador-de-notas.git
   cd gerenciador-de-notas
   ```

2. **Crie um arquivo `.env` na raiz do projeto** (opcional) com as variáveis de ambiente descritas acima.

3. **Construa e inicie os containers:**
   ```bash
   docker-compose up --build
   ```

4. **Acesse a aplicação:**
   - API: [http://localhost:3000](http://localhost:3000)
   - Documentação Swagger: [http://localhost:3000/docs](http://localhost:3000/docs)

### Sem Docker

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/gerenciador-de-notas.git
   cd gerenciador-de-notas
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Crie um arquivo `.env` na raiz do projeto** com as variáveis de ambiente.

4. **Compile e inicie a aplicação:**
   ```bash
   npm run build
   npm run start:prod
   ```

5. **Acesse a API e a documentação:**
   - API: [http://localhost:3000](http://localhost:3000)
   - Swagger: [http://localhost:3000/docs](http://localhost:3000/docs)

## Endpoints Principais

### Autenticação
- `POST /auth/signup` – Registra um novo usuário (email, senha e nome).
- `POST /auth/login` – Realiza login e retorna um token JWT válido por 1 hora.
- `GET /user` – Retorna os dados do usuário autenticado.

### Notas
- `POST /notes` – Cria uma nova nota (título obrigatório e descrição opcional).
- `GET /notes` – Lista todas as notas do usuário.
- `GET /notes/:id` – Retorna uma nota específica.
- `PATCH /notes/:id` – Atualiza uma nota.
- `DELETE /notes/:id` – Exclui uma nota.

> **Observação:** Cada usuário só pode criar, atualizar e excluir suas próprias notas. Tentativas de acessar notas de outros usuários resultarão em um erro 404.

## Testes Automatizados

- **Testes Unitários:**
  ```bash
  npm run test
  ```
- **Testes de Integração (E2E):**
  ```bash
  npm run test:e2e
  ```

## Documentação da API

A documentação interativa (Swagger) está disponível em:
[https://notas-backend-wa1c.onrender.com/docs](https://notas-backend-wa1c.onrender.com/docs)
