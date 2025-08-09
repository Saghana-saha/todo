const express= require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT=3000;

app.use(cors());
app.use(express.json());


const MONGO_URL = 'mongodb://127.0.0.1:27017/todo-app';


const connectDb = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

const todoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    dueDate:{type:Date}
});

const Todo=mongoose.model('Todo', todoSchema);

app.get('/todos', async (req, res) => {
    try {
        const todos = await Todo.find();
        res.status(200).json(todos);
    } catch (error) {     
        console.error('Error fetching todos');  
        res.status(400).json({ error: 'Failed to fetch todos' });
    }               
});
app.post('/todos', async (req, res) => {
    try {   
        const { title, description, completed, dueDate } = req.body;
        const newTodo = new Todo({ title, description, completed, dueDate });
        await newTodo.save();
        res.status(200).json(newTodo);
    } catch (error) {
        console.error('Error creating todo');
        res.status(400).json({ error: 'Failed to create todo' });
    }
});
// app.post('/todos', async (req, res) => {
//     try {
//         // Expecting req.body to be an array of todo objects
//         const todos = req.body;

//         if (!Array.isArray(todos)) {
//             return res.status(400).json({ error: 'Request body must be an array of todos' });
//         }

//         const newTodos = await Todo.insertMany(todos);
//         res.status(200).json(newTodos);
//     } catch (error) {
//         console.error('Error creating todos:', error);
//         res.status(400).json({ error: 'Failed to create todos' });
//     }
// });


app.put('/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, completed, dueDate } = req.body;
        const updatedTodo = await Todo.findByIdAndUpdate(id, { title, description, completed, dueDate }, { new: true });
        if (!updatedTodo) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.status(200).json(updatedTodo);  
    } catch (error) {
        console.log('Error updating todo:');
        res.status(400).json({ error: 'Failed to update todo' });
    }
});
app.delete('/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if(!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({error:'Invalid Id'});
        }
        const deleted =await Todo.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Todo not found' });
        }   
        res.status(200).json({ message: 'Todo deleted successfully',id:deleted._id });
    }   
    catch (error) {
        console.error('Error deleting todo');
        res.status(400).json({ error: 'Failed to delete todo' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDb();
});