const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const todoApplicationDatabaseFilePath = path.join(
  __dirname,
  "todoApplication.db"
);
const sqliteDriver = sqlite3.Database;

let todoApplicationDBConnectionObj = null;

const initializeDBAndServer = async () => {
  try {
    todoApplicationDBConnectionObj = await open({
      filename: todoApplicationDatabaseFilePath,
      driver: sqliteDriver,
    });

    app.listen(3000, () => {
      console.log("Server running and listening on port 3000 !");
    });
  } catch (exception) {
    console.log(`Error initializing DB and Server: ${exception.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

/*
    End-Point 1      : GET /todos
    Query Parameters : priority, status, search_q
    ----------------- 
    To handle client requests to fetch
    todo item data based on certain filters
    passed through query parameters
*/
app.get("/todos", async (req, res) => {
  const { search_q = "", priority = "", status = "" } = req.query;

  const getTodoItemDataQuery = `
  SELECT
    *
  FROM
    todo
  WHERE
    todo LIKE '%${search_q}%'
    AND
    priority LIKE '%${priority}%'
    AND
    status LIKE '%${status}%';
  `;

  const todoItemData = await todoApplicationDBConnectionObj.all(
    getTodoItemDataQuery
  );
  res.send(todoItemData);
});

/*
    End-Point 2: GET /todos/:todoId
    ------------
    To fetch data of specific
    todo item
*/
app.get("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;

  const queryToFetchSpecificTodoItemData = `
    SELECT
        *
    FROM
        todo
    WHERE
        id = ${todoId};
    `;

  const specificTodoItemData = await todoApplicationDBConnectionObj.get(
    queryToFetchSpecificTodoItemData
  );
  res.send(specificTodoItemData);
});

/*
    End-Point 3: POST /todos
    ------------
    To add new todo item data
    to the todo table
*/
app.post("/todos", async (req, res) => {
  const { id, todo, priority, status } = req.body;

  const queryToAddNewTodoItemData = `
    INSERT INTO
        todo (id, todo, priority, status)
    VALUES
        (${id}, '${todo}', '${priority}', '${status}');
    
    `;

  const addNewTodoDBResponse = await todoApplicationDBConnectionObj.run(
    queryToAddNewTodoItemData
  );
  res.send("Todo Successfully Added");
});

/*
    End-Point 4: PUT /todos/:todoId
    ------------
    To update data of specific todo
    with id: todoId
*/
app.put("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const { todo, priority, status } = req.body;

  let queryToUpdateSpecificTodoItemData = "";
  let todoUpdateSuccessMsg = "";

  if (todo !== undefined) {
    queryToUpdateSpecificTodoItemData = `
        UPDATE
            todo
        SET
            todo = '${todo}'
        WHERE
            id = ${todoId};
        `;

    todoUpdateSuccessMsg = "Todo Updated";
  } else if (priority !== undefined) {
    queryToUpdateSpecificTodoItemData = `
        UPDATE
            todo
        SET
            priority = '${priority}'
        WHERE
            id = ${todoId};
        `;

    todoUpdateSuccessMsg = "Priority Updated";
  } else if (status !== undefined) {
    queryToUpdateSpecificTodoItemData = `
        UPDATE
            todo
        SET
            status = '${status}';
        WHERE
            id = ${todoId};
        `;

    todoUpdateSuccessMsg = "Status Updated";
  }

  await todoApplicationDBConnectionObj.run(queryToUpdateSpecificTodoItemData);
  res.send(todoUpdateSuccessMsg);
});

/*
    End-Point 5: DELETE /todos/:todoId
    ------------
    To delete specific todo item 
    with id: todoId
*/
app.delete("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;

  const queryToDeleteSpecificTodoItem = `
    DELETE FROM
        todo
    WHERE
        id = ${todoId};
    `;

  await todoApplicationDBConnectionObj.run(queryToDeleteSpecificTodoItem);
  res.send("Todo Deleted");
});

module.exports = app;
