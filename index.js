const inquirer = require("inquirer");
const fs = require ("fs");
const util = require("util");
const axios = require("axios");

const writeFileAsync = util.promisify(fs.writeFile);

function promptUser(){
    return inquirer.prompt([
        {
            type:"input",
            name:"Title",
            message:" What is the project title ?"
        },
        {
            type:"input",
            name:"Description",
            message:" What is the description ?"
        },
        {
            type:"input",
            name:"Installation",
            message:" How to install your project ?"
        },
        {
            type:"input",
            name:"Usage",
            message:" How to use the application?"
        },
        {
            type:"list",
            choices:["MIT","GNU AGPLv3","GNU GPLv3","GNU LGPLv3","Mozilla","Apache","Boost","The Unlicense"],
            name:"License",
            message:" What is the license of your project?"
        },
        {
            type:"input",
            name:"Contributing",
            message:" How to contribute to your project?"
        },
        {
            type:"input",
            name:"Tests",
            message:" Any tests for this project?"
        },
        {
            type: "input",
            name: "github",
            message: "Enter your GitHub Username",
            validate: async function(input, answers){
                const queryUrl= `https://api.github.com/users/${input}`

                try{
                    // await till make code synchronous , so we use try and catch block instead of .catch()
                    await axios.get(queryUrl)
                    return true
                }catch{
                    return 'user not found'
                }
            }
        },
        {
            type: "input",
            name: "email",
            message: "what is your email address?"
        },
    ])
}

async function generateReadme(answers){
    let usage = "";
    if(answers.Usage !== ""){
        usage = `## Usage
        \r${answers.Usage}`
    }

    let title = "";
    if(answers.Title !== ""){
        title = `# ${answers.Title}`
    }

    let description = "";
    if(answers.Description !== ""){
        description = `## Description
        \r${answers.Description}`
    }

    let installation = "";
    if(answers.Installation !== ""){
        installation = `## Installation 
        \r${answers.Installation}`
    }

    let license = "";
    if(answers.License !== ""){
        license = `## License
        \r${answers.License}`
    }

    let contributing = "";
    if(answers.Contributing !== ""){
        contributing= `## Contributing
        \r${answers.Contributing}`
    }

    let tests = "";
    if(answers.Tests !== ""){
        tests= `## Tests
        \r${answers.Tests}`
    }

    let questions = "";
    const queryUrl= `https://api.github.com/users/${answers.github}`
    const avatar= await axios.get(queryUrl).then(function(res){
       return res.data.avatar_url;
    })
    //.then(res =>  res.data.avatar_url)
  
    if(answers.github !== ""){
        questions= `
## Questions
![avatar](${avatar})

If you have any questions about the repo, open an issue or contact 
[${answers.github}](https://github.com/${answers.github}) 
directly at ${answers.email}.
        `
    }
    
    return `
${title}
[![GitHub license](https://img.shields.io/badge/license-${encodeURIComponent(answers.License)}-blue.svg)](https://github.com/${answers.github})

${description}
## Table of contents
${ installation !=="" ? '* [Installation](#installation)' :""}
${ usage !== "" ? '* [Usage](#usage)' : ""}
${ license !=="" ? '* [License](#license)':""}
${ contributing !=="" ? `* [Contributing](#Contributing)`: ""}
${ tests !== "" ? '* [Tests](#Tests)':""}

${installation}
${usage}
${license}
${contributing}
${tests}
${questions}
    `; 
}

promptUser()
  .then(async function(answers) {
    const md = await generateReadme(answers);

    return writeFileAsync("userreadme.md", md);
  })
  .then(function() {
    console.log("Successfully wrote to userreadme.md");
  })
  .catch(function(err) {
    console.log(err);
  });


