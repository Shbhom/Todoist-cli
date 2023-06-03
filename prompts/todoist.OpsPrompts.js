import inquirer from "inquirer";
import * as dotenv from "dotenv"
import { TodoistApi, isSuccess } from "@doist/todoist-api-typescript";
import { createSpinner } from "nanospinner"
import chalk from "chalk";
import createTable from "../utils.js";
import { promisify } from "util"

dotenv.config()
const api = new TodoistApi(process.env.TODOIST_KEY)
const sleep = promisify(setTimeout)

function formattedDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`
}

const createTaskQuestion = [
    {
        type: "input",
        message: "Enter todo title : ",
        name: "todoTitle"
    },
    {
        type: "list",
        message: "Enter todo priority (higher the number higher the priority): ",
        name: "todoPriority",
        choices: ["1", "2", "3", "4"],
        default: "1"
    },
    {
        type: "input",
        message: "Enter todo due date (YYYY-MM-DD) : ",
        name: "todoDate",
        default: formattedDate()
    }
]

async function returnActiveTasks() {
    let activeTasks = []
    let i = 0
    await api.getTasks().then((tasks) => {
        tasks.forEach(task => {
            activeTasks.push({ title: task.content, id: task.id })
            i++
        })
    })
    return activeTasks
}
async function modifieReturnActiveTasks() {
    let activeTasks = [];
    await api.getTasks().then((tasks) => {
        tasks.forEach((task) => {
            const title = task.content;
            const id = task.id || "";
            const priority = task.priority || "";
            const date = task.due && task.due.date ? task.due.date : "";

            activeTasks.push({
                title,
                id,
                priority,
                date,
            });
        });
    });
    return activeTasks;
}
export async function GetTasks() {
    const spinner = createSpinner("getting tasks\n").start()
    await sleep(1000)
    let data = []
    await api.getTasks()
        .then((tasks) => {
            tasks.forEach((task) => {
                data.push({ title: task.content, priority: task.priority })
            });
            const table = createTable(data)
            spinner.success({ text: `${chalk.green(` tasks fetched successfully`)}\n${table}` })
        }).catch((e) => {
            spinner.error();
            console.log(`${chalk.red(`${e.responseData}`)}`)
            console.log(e)
        })
}
export async function CreateTask() {
    await inquirer.prompt(createTaskQuestion).then(async (answers) => {
        const spinner = createSpinner("creating task");
        spinner.start();
        api.addTask({
            content: answers.todoTitle,
            priority: answers.todoPriority,
            due_date: answers.todoDate
        }).then(async (task) => {
            spinner.success({ text: `${chalk.green(`Task ${task.content} created successfully \n   due at ${task.due.date}`)}` });
        })
            .catch((error) => {
                spinner.error({ text: `${chalk.red(` Failed to create task ${error.responseData}`)}` });
            });
    }).catch(e => console.log(e));
}
export async function Completion() {
    let tasks = await returnActiveTasks()
    let choices = []
    let taskId
    let spinner = createSpinner("Marking task as complete")
    tasks.forEach(task => {
        choices.push(task.title)
    })
    inquirer.prompt({
        type: "list",
        name: "taskCompletion",
        message: "Select from the Active Tasks",
        choices: choices
    }).then(answer => {
        tasks.forEach(task => {
            if (answer.taskCompletion === task.title)
                taskId = task.id
        })
        spinner.start()
        api.closeTask(taskId)
            .then(isSuccess => {
                spinner.success({ text: ` ${answer.taskCompletion} Marked as completed` })
            })
            .catch(e => {
                spinner.error({ text: `Failed to Mark as Completed due to ${e.responseData}` })
            }
            )
    }).catch(e => console.log(e))
}
export async function DeleteTask() {
    let tasks = await returnActiveTasks()
    let choices = []
    let taskId
    let spinner = createSpinner("deleting selected task")
    tasks.forEach(task => {
        choices.push(task.title)
    })
    inquirer.prompt({
        type: "list",
        name: "deleteTask",
        message: "Select from the Active Tasks",
        choices: choices
    }).then(answer => {
        tasks.forEach(task => {
            if (answer.deleteTask === task.title)
                taskId = task.id
        })
        spinner.start()
        api.deleteTask(taskId)
            .then(isSuccess => {
                spinner.success({ text: ` ${answer.deleteTask} deleted successfully` })
            })
            .catch(e => {
                spinner.error({ text: `Failed to delete task due to ${e.responseData}` })
            }
            )
    }).catch(e => console.log(e))
}
export async function UpdateTask() {
    let tasks = await modifieReturnActiveTasks()
    let choices = []
    let taskId, preupdatedPriority, preupdatedDueDate
    let updateTaskQuestions = [
        {
            type: "list",
            name: "updateTask",
            message: "Select from the Active Tasks : ",
            choices: choices
        },
        {
            type: "input",
            name: "updatedTitle",
            message: "Enter the updated title value : ",
            default: ""
        },
        {
            type: "input",
            name: "updatedPriority",
            message: "Enter the updated priority value : ",
            default: ""
        },
        {
            type: "input",
            name: "updatedDueDate",
            message: "Enter the updated Due Date value : ",
            default: ""
        },

    ]
    let spinner = createSpinner("updating task values")
    tasks.forEach(task => {
        choices.push(task.title)
    })
    inquirer.prompt(updateTaskQuestions)
        .then(answer => {
            tasks.forEach(task => {
                if (answer.updateTask === task.title) {
                    taskId = task.id
                    preupdatedDueDate = task.date
                    preupdatedPriority = task.priority
                }
            })
            spinner.start()
            if (answer.updatedTitle === '' && answer.updatedPriority === '' && answer.updatedDueDate === '') {
                spinner.error({ text: "Invalid all fields empty" })
            } else {
                const emptyTitle = !Boolean(answer.updatedTitle)
                const emptyPriority = !Boolean(answer.updatedPriority)
                const emptyDueDate = !Boolean(answer.updatedDueDate)
                const updatedValues = {
                    content: emptyTitle ?
                        answer.updateTask : answer.updatedTitle,
                    priority: emptyPriority ?
                        `${preupdatedPriority}` : answer.updatedPriority,
                    due_date: emptyDueDate ?
                        `${answer.updatedDueDate}` : answer.updatedDueDate
                }
                api.updateTask(taskId, updatedValues)
                    .then(isSuccess => {
                        spinner.success({ text: ` ${answer.updateTask} updated successfully` })
                    })
                    .catch(e => { spinner.error({ text: `Failed to Mark as Completed due to ${e.responseData}` }) })
            }
        })
        .catch(e => console.log(e))
}

// await todoistUpdateTask()