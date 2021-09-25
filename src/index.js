const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

var usuarios = [];

app.use(cors());
app.use(express.json());

// const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const usuario = usuarios.find((usuario) => usuario.username === username);

  if(!usuario){
      return response.status(404).json({ error:"Usuário não encontrado" });
  }

  request.usuario = usuario;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usuarioExiste = usuarios.find((usuario) => usuario.username === username);

  if(usuarioExiste){
    return response.status(400).json({error: "Usuário já existe"});
  }

  usuario = {
    name,
    username,
    id: uuidv4(),
    todos: []
  };
  usuarios.push(usuario);

  return response.status(201).json(usuarios);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { usuario } = request;

  return response.json(usuario.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { usuario } = request;

  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title, 
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  usuario.todos.push(todo);

  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { usuario } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  
  const todo = usuario.todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "Tarefa não encontrada"});
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { usuario } = request;
  const { id } = request.params;

  const todo = usuario.todos.find((todo) => todo.id === id);

  if(!todo){
    return response.status(404).json({error: "Tarefa não encontrada"});
  }

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { usuario } = request;
  const { id } = request.params;

  const todoIndex = usuario.todos.findIndex((todo) => todo.id === id);

  if(todoIndex === -1){
    return response.status(404).json({error: "Tarefa não encontrada"});
  }

  usuario.todos.splice(todoIndex, 1);

  return response.status(201).json();
});

module.exports = app;