MVP (Minimum Viable Product)

Main UI
    Board Categories
        Make Board Category
        Delete Board Category
    Boards
        Create Board
        Select One of the Active Boards to Open
        Move Board to Category
        Move Board out of Category
        Delete Board

Individual Board
    List
        Create List
        Rename List
        Drag and Drop List to Reorder
        Delete List
    Card
        Create Card
        Rename Card
        Drag and Drop within List
        Drag and Drop between Lists
        Modal Content
            Add Card Description
            Labels
                Create Label
                Assign Label Color
                Delete Label
            Assign Label
            Unassign Label
            Exit Modal  
        Archive Card
        Delete Card




Main UI
    Board Categories
        Boards
            Individual Board
                List  
                    Card
        


function onCloseButtonClicked() {
    query('.app-wrapper').removeChild(query('.modal'));
  }
  listen('click', '#close-button', onCloseButtonClicked);