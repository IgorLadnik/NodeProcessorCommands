# NodeProcessorCommands

# Notes

To test application run it either from VS Code / WebStorm or with file "start.cmd".

Browser:
- simple test with database access: http://localhost:19019
- Open API (Swagger):               http://localhost:19020/v1

# Open Issues

Remote commands loading has been added. So far rather simple "file-server" app. is used for commands upload.
Relevant code in Processor is still temporary (marked with //TEMP).

Currently remote commands should contain full local path in their "require"Currently remote commands

Currently multiple remote commands can not be called using command template with asterisk "*" due to lack of "file-server" support.