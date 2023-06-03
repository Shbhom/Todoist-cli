import inquirer from "inquirer";
import { writeFileSync } from "fs"


export async function todoistkey() {
  await inquirer.prompt({
    type: "input",
    message: "Enter  api key : ",
    name: "todoistKey"
  }).then((answer) => {
    const cwd = process.cwd()
    writeFileSync(cwd + '/.env', `TODOIST_KEY="${answer.todoistKey}"\n`)
  }).catch(e => { console.log(e) })
}
