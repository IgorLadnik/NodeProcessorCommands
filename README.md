# NodeProcessorCommands

# Notes

To test application run it either from VS Code / WebStorm or with file "start.cmd".

Browser:
- simple test with database access: http://localhost:19019
- Open API (Swagger):               http://localhost:19020/v1

# Open Issues

Remote commands loading has been added. So far rather simple "file-server" app. is used for commands upload.
Relevant code in Processor is still temporary (marked with //TEMP).

Remote commands should not use static import. Use dynamic import or "require" in stead, e.g.<br/><br/>
<i>const Command = (await import(`${p.workingDir}/models/command`)).Command;</i><br/>   
or<br/><br/> 
<i>const Command = require(`${p.workingDir}/models/command`).Command;</i><br/><br/>

Currently multiple remote commands can not be called using command template with asterisk "*" due to lack of "file-server" support.
