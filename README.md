# Intro

Currently, the most of server-side applications are developed using either **monolithic** or **micro-service** architecture.
Each of them has its well-known pros and cons.  
This work is an attempt to suggest an architecture that combines good points of both approaches and mitigates their weak points.
I fully realize that this is not a "golden bullet" that will solve all complex architectural issues of servers.
But IMHO this approach, illustrated with code, at least deserves to be discussed.  

# Concept

The main idea behind this project is to provide a "universal" infrastructure to a service.
The service consists of two strictly separated parts, namely, **Processor** and **Commands**.
Its simplified design is depicted below.

![Processor-Commands Schema](/images/Processor-Commands%20Schema.png)

The processor is responsible for service infrastructure and provides mechanism for execution of commands, diagnostics, management, etc.
Processor is a universal stable seldom changed part of a service.

In contrast, commands are volatile pieces of code responsible for actual service activities.
Each command constitutes a function with uniform signature that is uploaded by a processor at runtime from either local or remote repository.
These functions carry out various business tasks.
Commands are very flexible.
They can call another commands in either series or parallel way, sync- or asynchronously.
Commands in their course of actions do anything, e.g. create Web servers, access database, perform business logic.

# Merits

Such an approach to service implementation has several important merits:<br/>
- the most complex part of service software (which is a processor) is universal and seldom changed, which reduces developers efforts and amount of required testing,<br/>
- service is very flexible allowing implementation of different configurations by selecting appropriate set of commands,<br/>
- due to flexibility of commands they may be used for a wide range of products with the same processor,
- ensures better performance for commands chain execution since all commands may run locally in one process without network communication with other services,<br/>
- possibility to change commands (and therefore service behavior) "on the fly" without service redeployment and even restart,<br/>
- easy scaling since all services (processors) are the same,<br/>
- allows service to easily support different versions of commands for different clients,<br/>
- from organizational perspective, it is easy to develop fine granulated commands without bothering of infrastructure issues, especially for new developers.<br/>

# Notes

After a download the following programs should be called from command line in order to run service:<br/>

<i>npm install</i><br/>
<i>tsc</i><br/>
<i>node dist/app.js</i><br/>

To test application run it either in VS Code / WebStorm or (in Windows) with command file <i>start.cmd</i>.<br/>

By default, application runs without message broker and database.
To enable locally installed message broker (RabbitMQ) and database (SQLServer) 
**Config.isRunStandAlone** (in a file *config.ts*) should be set to *false*.

Browser:<br/>
- Open API (Swagger):               http://localhost:19020/v1
- simple test with database access: http://localhost:19019 (if activated)

Using dependencies, command should provide full local path to them.
This can be achieved with object <i>p</i> of IProcessor interface available as an argument of command function like, for example:<br/>

    const Command = require(`${p.workingDir}/models/command`).Command;

# Limitations

Please note that some commands in <i>master</i> branch 
- deal with local resources (SQL Server and RabbitMQ) not available here, and<br/>
- for remote commands upload a simple file server is required (it may be found here: https://github.com/IgorLadnik/file-server).

# Known Issues

Currently, multiple remote commands cannot be called using command name template with an asterisk "*" due to lack of file server support.
