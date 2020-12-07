# MailBot

Medieval Server MailBot

# TODO

  * [X] events folder 
    * [ ] ready
    * [ ] message
     * [X] split emit a dm message as "dmMessage"

# Functionality 
* [X] It can sent / create the threads into the staff server.
* [ ] It can have snippets added / created / removed.
* [ ] It can move threads into certain departments if needed.

# Server Schema 

 * Departments - Array of [DepartmentData](#Department-Data)
 * Snippets - [Snippets module](#Snippets-Module)

# Department-Data
 - DepartmentData - Object
    * name: string

    * RoleID: string

    * parentID: string (parent channel category id)
 
# Snippets-Module

 - type - Array of SnippetData

  -  SnippetData - Object

```yml
    //! separator will be replaced by "%" instead of "`" 
  name: string, replace spaces by "~". Resolve later

    //! "max" is the max length the discord embed description can be   
  description: string, max = 2048

    // random snippet id
  id: string
```