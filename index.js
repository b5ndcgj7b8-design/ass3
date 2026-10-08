import express from "express";
import fs from "fs/promises";

const app = express();
const PORT = 3000;
const filePath = "./users.json";

app.use(express.json());

// Read users from JSON file
async function readUsers() {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write users to JSON file
async function writeUsers(users) {
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));
}

// 1. Add User
app.post("/user", async (req, res) => {
  try {
    const { name, age, email } = req.body;

    if (!name || age === undefined || !email) {
      return res.status(400).json({
        message: "name, age and email are required"
      });
    }

    const users = await readUsers();

    const emailExists = users.some(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (emailExists) {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    const newUser = {
      id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
      name,
      age,
      email
    };

    users.push(newUser);
    await writeUsers(users);

    res.status(201).json({
      message: "User added successfully",
      user: newUser
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 2. Update User by ID
app.patch("/user/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, age, email } = req.body;

    const users = await readUsers();
    const user = users.find(user => user.id === id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (email) {
      const emailExists = users.some(
        otherUser =>
          otherUser.id !== id &&
          otherUser.email.toLowerCase() === email.toLowerCase()
      );

      if (emailExists) {
        return res.status(409).json({
          message: "Email already exists"
        });
      }
    }

    if (name !== undefined) user.name = name;
    if (age !== undefined) user.age = age;
    if (email !== undefined) user.email = email;

    await writeUsers(users);

    res.json({
      message: "User updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 3. Delete User by ID
// ID can be supplied as /user/:id OR in the request body as { "id": 1 }
async function deleteUser(req, res) {
  try {
    const id = Number(req.params.id ?? req.body.id);

    if (!id) {
      return res.status(400).json({
        message: "User id is required"
      });
    }

    const users = await readUsers();
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);

    await writeUsers(users);

    res.json({
      message: "User deleted successfully",
      user: deletedUser
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

app.delete("/user/:id", deleteUser);
app.delete("/user", deleteUser);

// 4. Get User by Name
// Example: GET /user/getByName?name=Ahmed
app.get("/user/getByName", async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        message: "Name query parameter is required"
      });
    }

    const users = await readUsers();

    const user = users.find(
      user => user.name.toLowerCase() === name.toLowerCase()
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 5. Get all users
app.get("/user", async (req, res) => {
  try {
    const users = await readUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 6. Filter users by minimum age
// Example: GET /user/filter?minAge=20
app.get("/user/filter", async (req, res) => {
  try {
    const minAge = Number(req.query.minAge);

    if (Number.isNaN(minAge)) {
      return res.status(400).json({
        message: "minAge query parameter is required and must be a number"
      });
    }

    const users = await readUsers();

    const filteredUsers = users.filter(user => user.age >= minAge);

    res.json(filteredUsers);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// 7. Get User by ID
app.get("/user/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const users = await readUsers();
    const user = users.find(user => user.id === id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});