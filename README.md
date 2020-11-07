# MailBot

Medieval Server MailBot

# TODO

  * [X] events folder 
    * [ ] ready
    * [ ] message
     * [X] split emit a dm message as "dmMessage"

# Functionality 
* [ ] It can sent / create the threads into the staff server.
* [ ] It can have snippets added / created / removed.
* [ ] It can move threads into certain departments if needed.

# Server Schema 

 * Departments - Array of DepartmentData
 * Snippets - [Snippets module](#Snippets-Module)

 - DepartmentData - Object
  * name: string

  * RoleID: string
 
# Snippets-Module

 - type - Array of SnippetData

  -  SnippetData - Object

    * name: string, replace spaces by "~". Resolve later

    * description: string, max = 2048

    * id: string