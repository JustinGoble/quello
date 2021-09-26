(function() {
    const createEl = document.createElement.bind(document); // alias for creating an element
    const getEl = document.getElementById.bind(document); // alias for selecting an element by ID
    const query = document.querySelector.bind(document); // alias for query selector
    const globals = {
        categoryList: getEl("category-list"),
        createCategory: getEl('create-category'),
        boardList: getEl('board-list'),
        createBoard: getEl('create-board'),
        horizontalRule: createEl("hr"),
        categoryArray: [],
        boardArray: [],
    };
    let UI = {
        elBoard: getEl('board'),
        elCardPlaceholder: null,
        },
        lists = [],
        cardData = [],
        isDragging = false,
        _headingCounter = 0,
        _addCardCounter = 0,
        _listCounter = 0,
        _cardCounter = 0;


    function createCategory() {
        const catInput = createEl("input");
        catInput.id = "cat-input";
        globals.categoryList.append(catInput);
        console.log(catInput.parentNode);
        catInput.addEventListener("keypress", saveCategory);
    }

    function refreshCategoryList() {
        let sortedCategories = globals.categoryArray.sort();
        while ( globals.categoryList.firstChild ) {
            globals.categoryList.removeChild(globals.categoryList.firstChild);
        }
        sortedCategories.forEach(function(item) {
            let categoryItem = document.createElement("div");
            let textnode = document.createTextNode(item);
            categoryItem.appendChild(textnode);
            globals.categoryList.appendChild(categoryItem);
            });
    }

    function saveCategory (event) {
        const catInput = getEl("cat-input");
        const category = createEl("div");
        const categoryList = getEl("category-list");
        if (event.key === 'Enter' && catInput !== "" && catInput.value.length > 0) {
            const catInputValue = catInput.value;
            category.textContent = catInputValue;
            globals.categoryArray.push(catInputValue);
            categoryList.append(category);
            refreshCategoryList();
            catInput.removeEventListener("keypress", saveCategory);
        }
    }

    function createBoard() {
        const boardInput = createEl("input");
        boardInput.id = "board-input";
        globals.boardList.append(boardInput);
        boardInput.addEventListener("keypress", saveBoard);
    }

    function refreshBoardList() {
        let sortedBoards = globals.boardArray.sort();
        while ( globals.boardList.firstChild) {
            globals.boardList.removeChild(globals.boardList.firstChild);
        }
        sortedBoards.forEach(function(item) {
            const boardItem = createEl("div");
            boardItem.className  += "board-name";
            const textNode = document.createTextNode(item);
            boardItem.appendChild(textNode);
            globals.boardList.appendChild(boardItem);
            });
        const createButton = createEl('div');
        createButton.id = 'create-board';
        createButton.textContent = '+ Create New Board';
        globals.boardList.appendChild(createButton);
    }

    function saveBoard (event) {
        const boardInput = getEl("board-input");
        const board = createEl("div");
        const boardList = getEl("board-list");
        if (event.key === 'Enter' && boardInput !== "" && boardInput.value.length > 0) {
            const boardInputValue = boardInput.value;
            board.textContent = boardInputValue;
            globals.boardArray.push(boardInputValue);
            boardList.append(board);
            refreshBoardList();
            boardInput.removeEventListener("keypress", saveBoard);
        }
    }

    function createCard(text, listID, index) {
        if(!text || text === null) return false;
        const newCardId = ++_cardCounter;
        const card = createEl("div");
        const editButton = createEl('span');
        const editButtonImg = createEl('img');
        editButton.className = 'edit-button';
        editButtonImg.className = 'edit-button-img';
        editButtonImg.src = 'images/editicon.png'
        card.draggable = true;
        card.dataset.id = newCardId;
        card.dataset.listId = listID;
        card.id = 'todo_'+newCardId;
        card.className = 'card';
        card.innerHTML = text.trim();
        editButton.appendChild(editButtonImg);
        card.appendChild(editButton);

        let todo = {
        _id: newCardId,
        listID: listID,
        text: text,
        dom: card,
        index: index // Relative to list
        };

        cardData.push(todo);
        return card;
    }

    function detailsModal(headerText) {
        const modalContainer = createEl('div');
        const modalSaveButton = createEl('button');
        const modalHeader = createEl('h3');
        const modalDetails = createEl('div');
        const closeButton = createEl('span');
        const textContent = createEl('textarea');
        textContent.id = 'text-content';
        modalContainer.id = 'modal-container';
        closeButton.id= 'close-button';
        modalContainer.classList.add('modal');
        modalSaveButton.classList.add('modal-save-button','button');
        modalSaveButton.textContent = "Save";
        modalHeader.classList.add('modal-header');
        modalDetails.classList.add('modal-details');
        modalHeader.textContent = headerText.textContent;
        closeButton.innerHTML = '&times;'
        query('.app-wrapper').appendChild(modalContainer);
        modalContainer.appendChild(modalDetails);
        modalDetails.appendChild(closeButton);
        modalDetails.appendChild(modalHeader);
        modalDetails.appendChild(textContent);
        modalDetails.appendChild(modalSaveButton);
        query('#modal-container').style.display = "block";
    }

    function addCard(text, listID, index) {
        listID = listID;
        if(!text) return false;
        let list = getEl('list_'+listID);
        let card = createCard(text, listID, index);
        if(index) {
        list.insertBefore(card, list.children[index]);
        } else {
        list.appendChild(card);
        }
    }

    function addList(name) {
        name = name.trim();
        if(!name || name === '') return false;
        let newHeadingID = ++_headingCounter;
        let newListID = ++_listCounter;
        let newAddCardID = ++_addCardCounter;
        const listOuter = createEl("div");
        const list = createEl("div");
        const createCardButton = createEl("div");
        const heading = createEl("h2");
        listOuter.appendChild(list);
        listOuter.appendChild(createCardButton);
        list.appendChild(heading);
        listOuter.className = "list-container";
        createCardButton.innerHTML = "Add New Card";
        createCardButton.className = "add-card";
        list.dataset.id = newListID;
        list.id = 'list_'+newListID;
        createCardButton.id = 'add_' + newAddCardID;
        list.className = "list";
        heading.className = "listname";
        heading.innerHTML = name;
        heading.id = 'heading_' + newHeadingID;
        lists.push({
        _id: newListID,
        name: name,
        });
        UI.elBoard.append(listOuter);
    }

    function getList (obj) {
        return _.find(lists, obj);
    }

    function getTodo (obj) {
        return _.find(cardData, obj);
    }

    function moveCard(cardId, newListId, index) {
        if(!cardId) return false;
        try {
        let card = getTodo({_id: cardId});
        if(card.listID !== newListId) {
            --getList({_id: card.listID}).cards;
            card.listID = newListId;
            ++getList({_id: newListId}).cards;
        }
        if(index){
            card.index = index;
        }
        } catch (e) {
        }
    }

    function getCardPlaceholder () {
        if(!UI.elCardPlaceholder) {
        UI.elCardPlaceholder = createEl('div');
        UI.elCardPlaceholder.className = "card-placeholder";
        }
        return UI.elCardPlaceholder;
    }

    function listen(eventType, selector, fn) {
        document.addEventListener(eventType, function (event) {
        if (event.target.webkitMatchesSelector(selector)) {
            fn.call(event.target, event);
        }
        }, false);
    }

    function addListOnClick(event) {
        event.preventDefault();
        addList(_.trim(this.list_name.value));
        this.reset();
        return false;
    }

    function handleDragStart(event) {
        isDragging = true;
        event.dataTransfer.setData('text/plain', event.target.dataset.id);
        event.target.classList.add('dragging');
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        if(this.className === "list") {
        this.appendChild(getCardPlaceholder());
        } else if(this.className.indexOf('card') !== -1) {
        this.parentNode.insertBefore(getCardPlaceholder(), this);
        }
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        UI.elCardPlaceholder && UI.elCardPlaceholder.remove();
        UI.elCardPlaceholder = null;
        isDragging = false;
    }

    function handleDragDrop(event) {
        event.preventDefault();
        if(!isDragging) return false;
        let todo_id = +event.dataTransfer.getData('text');
        let todo = getTodo({_id: todo_id});
        let newListID = null;
        if(this.className === 'list') { // Dropped on List
        newListID = this.dataset.id;
        this.appendChild(todo.dom);
        } else { // Dropped on Card Placeholder
        newListID = this.parentNode.dataset.id;
        this.parentNode.replaceChild(todo.dom, this);
        }
        moveCard(todo_id, +newListID);
    }

    function showDetailsModal(event) {
        if (event.target.nodeName !== "TEXTAREA"){
            detailsModal(event.target);
        }
    }

    function closeDetailsModal(event) {
        event.stopPropagation();
        query('.app-wrapper').removeChild(query('.modal'));
    }

    function addNewCard(event) {
        const elementID = event.target.id;
        const element = getEl(elementID);
        const parentList = getEl(element.parentNode.childNodes[0].id);
        const newEl = createEl("textArea");
        newEl.id = "card-input";
        const cardInput = getEl('card-input');
        newEl.classList.add("card");
        newEl.placeholder = "Name your card";
        parentList.append(newEl);
        newEl.focus();

        listen('keypress','.card', function (event) {
            if (event.key === 'Enter') {
                const listID = element.parentNode.childNodes[0].dataset.id;
                const cardName = newEl.value;
                newEl.parentNode.removeChild(newEl);
                addCard(cardName, listID, null, false);
            }
        });
    }

    function editCardName(event) {
        const currentCard = event.target.parentNode.parentNode;
        const cardText = createEl('textarea');
        cardText.id = 'edit-card-text';
        cardText.textContent = currentCard.textContent;
        currentCard.textContent = '';
        currentCard.appendChild(cardText);
        listen('keypress','#edit-card-text', function (event) {
            if (event.key === 'Enter') {
                const newCardText = cardText.value;
                const editButton = createEl('span');
                const editButtonImg = createEl('img');
                event.target.parentNode.removeChild(cardText);
                currentCard.textContent = newCardText;
                editButton.className = 'edit-button';
                editButtonImg.className = 'edit-button-img';
                editButtonImg.src = 'images/editicon.png';
                editButton.appendChild(editButtonImg);
                currentCard.appendChild(editButton);
            }
        });
    }

    function deleteCard(event) {
        event.stopPropagation();
        const parent = event.target.parentNode;
        parent.removeChild(event.target);
    }

    listen('click', '#create-category', createCategory);
    listen('click', '#create-board', createBoard);
    listen('submit', '#frmAddList', addListOnClick);
    listen('dragstart', '.card', handleDragStart);
    listen('dragover', '.list, .card, .list, .card-placeholder', handleDragOver);
    listen('dragend', '.card', handleDragEnd);
    listen('drop', '.list, .list .card-placeholder', handleDragDrop);
    listen('click', '.card', showDetailsModal);
    listen('click', '#close-button', closeDetailsModal);
    listen('click','.add-card', addNewCard);
    listen('click', '.edit-button-img', editCardName);
   // listen('click', '.card', deleteCard);



    function init () {

        addList('Backlog');
        addList('Priority');
        addList('In Progress');
        addList('Done');
        addCard('Add Categories', 1, null);
        addCard('Add Main UI', 1, null);
        addCard('Add Board Management', 1, null);
        addCard('Create Board', 2, null);
        addCard('Rename Board', 2, null);
        addCard('Move Boards Between Categories', 2, null);
        addCard('Delete Boards', 2, null);
        addCard('Create Labels', 2, null);
        addCard('Assign Labels', 2, null);
        addCard('Add Data Persistence', 3, null);
        addCard('Create Cards', 4, null);
        addCard('Rename Cards', 4, null);
        addCard('Drag and Drop Cards Within Lists', 4, null);
        addCard('Drag and Drop Cards Between Lists', 4, null);
        addCard('Delete Cards', 4, null);
        addCard('Create Lists', 4, null);
        addCard('Rename Lists', 4, null);
        addCard('Delete Lists', 4, null);
        addCard('Create Modal', 4, null);
        addCard('Edit Modal', 4, null);
        addCard('Close Modal', 4, null);
    }

  document.addEventListener("DOMContentLoaded", function() {
    init();
  });
})();
