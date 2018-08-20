#tag-tool

====================================================

Required： Node environment; Don't know how to install node ? check this link for more information.

## How to use 如何使用

1. Open terminal, run `tt init` to initialize，input the relase date as the format it required. This command will create a release file（yyyymmdd.txt）, make sure you input the required infomartion like DB1, NAS_FILE etc.

1. 在Terminal中运行 `tt init`, 按照一定的格式输入上线日期。该命令将创建一个release文件(yyyymmdd.txt)，请不要忘记在此txt文件中填入相关信息

2. After you commit and push the code to gitlab, run `tt` command, it will automatically create a tag as our CI flow required, recognizing which tag it should use based on the branch name, push it to the gitlab.

 
