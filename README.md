# Concept

<p>
The main idea behind this project is to provide a "universal" infrastructure to a service.
The service consists of two strictly separated parts, namely, Processor and Commands.
The processor is responsible for service infrastructure and provides mechanism for execution of commands.
</p>
<p>
Processor is universal stable seldom changed part of a service.
Its the only purpose is to ensure execution of commands.
</p>
<p>
In contrast, commands are volatile pieces of code responsible to actual service activities.
Each command constitutes a function with uniform signature that is uploaded by processor at runtime from either local or remore ropository.
These functions carry out various business tasks.
Commands are very flexible.
They can call another commands in either in series or in parallel way, sync- or asynchronous.
Commands in their course of actions do anything, e.g. create Web servers, access database, perform business logic.
</p>

# Merits

Such an approach to service implementation has several important merits:<br/>
- the most complex part of service software (which is processor) is universal and changed seldom, which reduces developers efforts and amount of required testing,<br/>
- service is very flexible allowing implementation of different configurations by selecting appropriate set of commands,<br/>
- due to flexibility of commands may be used for a wide range of products with the same processor,
- ensures better performance for commands chain execution since all commands may be fulfilled localy in one process without network communication with other services,<br/>
- possibility to change commands (and therefore service behavior) "on the fly" without service redeployment and even restart,<br/>
- easy scaling since all services (processors) are the same,<br/>
- allows service to easily support different versions of commands for different clients,<br/>
- from organizational perspective, it is easy to develop fine granulated commands without bothering of infrastructure issues, especially for new developers.<br/>

# Notes

After download the followng programs should be called from command line in order to run service:<br/>

<i>npm install</i><br/>
<i>tsc</i><br/>
<i>node dist/app.js</i><br/>

To test application run it either in VS Code / WebStorm or (in Windows) with command file <i>start.cmd</i>.<br/>

Browser:<br/>
- simple test with database access: http://localhost:19019 (<i>master</i> branch only)<br/>
- Open API (Swagger):               http://localhost:19020/v1 (both <i>master</i> and <i>ready-to-run</i> branches)<br/>

<p>
Using dependencies, command should provide full local path to them.
This can be achieved with object <i>p</i> of IProcessor interface available as an argument of command function like, for example:<br/>
<br/><i>const Command = require(`${p.workingDir}/models/command`).Command;</i>
</p>

# Limitations

Please note that some commands in <i>master</i> branch 
- deal with local resources (SQL Server and RabbitMQ) not available here, and<br/>
- for remote commands upload a simple file server is required (it may be found here: https://github.com/IgorLadnik/file-server).<br/> 

To avoid usage of unavailable resources software from <i>ready-to-run</i> branch may be used.

# Known Issues

<p>
Currently multiple remote commands can not be called using command name template with asterisk "*" due to lack of file server support.
</p>
