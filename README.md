# NodeProcessorCommands

# Notes

To test application run it either from VS Code / WebStorm or with file "start.cmd".

Browser:
- simple test with database access: http://localhost:19019
- Open API (Swagger):               http://localhost:19020/v1

# Open Issues

Remote commands loading has been added. So far rather simple "file-server" app. is used for commands upload.
Relevant code in Processor is still temporary (marked with //TEMP).

Remote commands should not contain static import. Use "require" in stead, e.g.
    const Command = require(p.getWorkingDir() + '/models/command').Command;

Currently multiple remote commands can not be called using command template with asterisk "*" due to lack of "file-server" support.
