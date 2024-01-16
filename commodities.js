const itemArray = [];
var displayedArray = new Array();
var dropDownListChecker = 0;
var myChart = null;

let getCommoditiesItem = () => {

    //set the url to the server-side script
    url = "item.php";
    ajaxRequest("GET", url, "", displayItem)
}

function Commodity(id, name, information, code) {
    this.id = id;
    this.name = name;
    this.information = information;
    this.code = code;
}

function nameSort(a,b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

//call back function which will store the object literals in an array and sort them alphabetically via name

let displayItem = (response) =>{
    //Receiving the JSON data from PHP
    let data = JSON.parse(response);
    for(let i = 0; i < data.length; i++){
        itemArray.push(new Commodity(data[i].id,data[i].name,data[i].information,data[i].code));
    }    
    itemArray.sort(nameSort);
    //Testing purposes
    for(let j = 0; j < itemArray.length; j++) {
        console.log(itemArray[j].name);
    }
    //Creating the drop down list and paragraph
    const para = document.createElement("p");
    para.innerText = "Commodity List";
    para.id = "p1";
    document.body.appendChild(para);
    createDropDown("dropDownList", addWidget);

}

function createDropDown(id, onchange) {
    //Creating the select element
    var myBody = document.body;
    var selectDiv = document.createElement("div");
    selectDiv.setAttribute("id", "dropDownLists");
    myBody.appendChild(selectDiv);
    var selectList = document.createElement("select");
    selectList.id = id;
    selectList.onchange = onchange;
    selectDiv.appendChild(selectList);
    var startText = document.createElement("option");
    //The starting selected value
    startText.text = "Select a Commodity";
    startText.value = "Start";
    selectList.appendChild(startText);
    displayedArray.push(startText.value);
    //The Commodity items
    for (var i = 0; i < itemArray.length; i++) {
        var option = document.createElement("option");
        option.value = i;
        option.text = itemArray[i].name;
        selectList.appendChild(option);
    }
}

let ajaxRequest = (method, url, data, callback) => {

    //Initialise the XMLHttpRequest Object and the request
    var request = new XMLHttpRequest();
    request.open(method,url);

    //Check for post and add the header
    if(method == "POST"){
        request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    }
    
    //Callback function
    request.onload = function(){
        var response = request.responseText;
        //Set what happens when the request returns successfully
        callback(response);
    }

    //Sending the data
    request.send(data);
}

function addWidget() {
    var checkNum = 0;
    var dropDown = document.getElementById("dropDownList");
    //Getting the value of the item selected in drop down list
    var dropDownValue = dropDown.value;
    //Checking because displayedArray has 1 more value called "Start"
    if(dropDownValue != "Start") {
        //Checking whether the item selected is already displayed
        for(let i = 0; i <= displayedArray.length; i++) {
            if(displayedArray[i] == dropDownValue) {
                checkNum = 1;
            }
        }
        //If the commodity hasn't been displayed
        if(checkNum == 0) {
            //create a variable to store the 'div' element that the widget will sit in
            place = document.createElement("div");
            place.classList.add("commodity-list");
            //append the new div to the DOM
            placeholder = document.getElementById("dashboard");
            placeholder.appendChild(place);
        
            let newList = new CommodityWidget(place);
            displayedArray.push(dropDownValue);
        }
    }
}

//Constructor function for CommodityWidget
//parameter is the element on the page that the DOM of the widget is appended to
function CommodityWidget(container_element){
    
    //PROPERTIES
    //declare properties for the widget's UI and write the code to initalise them
    let ui = {
        container: container_element,
        descriptionContainer: null,
        commoditySelect: null,
        graphButton: null,
    };

    var dropDown = document.getElementById("dropDownList");
    var dropDownValue = dropDown.value;

    createUI();

    //FUNCTIONS

    function createUI() {
        //create the UI for the widget
        ui.container.className = "commodity-widget";

        //create container to store description
        ui.descriptionContainer = document.createElement("input");
        ui.descriptionContainer.setAttribute("type", "text");
        ui.descriptionContainer.setAttribute("value", itemArray[dropDownValue].information);
        ui.descriptionContainer.setAttribute("readOnly", "true");
        ui.descriptionContainer.setAttribute("size", 30);
        ui.descriptionContainer.className = "description-container";
        ui.container.appendChild(ui.descriptionContainer);

        //create the graph button element
        ui.graphButton = document.createElement("button");
        ui.graphButton.className = "graph-button";
        ui.graphButton.textContent = "Graph";
        ui.graphButton.addEventListener("click", makeGraph);
        ui.container.appendChild(ui.graphButton);

        //create the remove button element
        ui.removeButton = document.createElement("button");
        ui.removeButton.className = "remove-button";
        ui.removeButton.textContent = "Remove";
        ui.removeButton.addEventListener("click", remove);
        ui.container.appendChild(ui.removeButton);
    }

    async function makeGraph() {
        getCommodity();
    }

    let getCommodity = () => {
        //Get the commodity selected code
        var commodity = itemArray[dropDownValue].code;
        let qstring = "https://www.alphavantage.co/query?function="+commodity+"&interval=monthly&apikey=DJBA3XR0SZ0JIPPF";
        fetch(qstring,{method:'get'})
        .then(response => response.json())
        .then(showData);
    }

    let showData = (response) => {

        const commodityValueArray = [];
        const commodityDateArray = [];
        // alert(response.data.length); //Testing purposes
        //Gets all the response data into an array
        for(let i = 0; i < response.data.length; i++) {
            commodityValueArray.push(response.data[i].value);
            commodityDateArray.push(response.data[i].date);
        }

        //Checking for instances of myChart and destroying them if there is
        if(myChart) {
            myChart.destroy();
        }
        //Making the line chart
        const canvas = document.getElementById("myChart");
        const ctx = canvas.getContext('2d');
        myChart = new Chart(ctx, {
            type: "line",
            data: {
              labels: commodityDateArray,
              datasets: [{
                label: itemArray[dropDownValue].code,
                fill: false,
                backgroundColor:"rgba(0,0,255,1.0)",
                borderColor: "rgba(0,0,255,0.1)",
                data: commodityValueArray
              }]
            },
            options: {
                legend: {display: false},
            }
        });
        // console.log(commodityValueArray) //Testing Purposes

        //Making the second drop down list that the user can use to select a commodity to compare. Checks to see whether there's a second drop down already or not
        if(dropDownListChecker == 0) {
            const para = document.createElement("p");
            para.innerText = "Comparative Commodity";
            para.id = "p2";
            document.body.appendChild(para);
            createDropDown("dropDownList2", createCompareGraph);
            dropDownListChecker = 1;
        }
        // alert(dropDownListChecker); //Testing Purposes

        async function createCompareGraph() {
            getCompareCommodity();
        }

        let getCompareCommodity = () => {
            var list = document.getElementById("dropDownList2");
            var listValue = list.value;
            //Get the commodity selected code
            var commodity = itemArray[listValue].code;
            let qstring = "https://www.alphavantage.co/query?function="+commodity+"&interval=monthly&apikey=DJBA3XR0SZ0JIPPF";
            fetch(qstring,{method:'get'})
            .then(response => response.json())
            .then(showCompareGraph);
        }
    
        let showCompareGraph = (response) => {
            var list = document.getElementById("dropDownList2");
            var listValue = list.value;
            const commodityCompareValueArray = [];
            const commodityCompareDateArray = [];
            // alert(response.data.length); //Testing purposes
            //Gets all the response data into an array
            for(let i = 0; i < response.data.length; i++) {
                commodityCompareValueArray.push(response.data[i].value);
                commodityCompareDateArray.push(response.data[i].date);
            }
            // Define the data to add to dataset
            var newData2 = {
                label: itemArray[listValue].code,
                fill: false,
                backgroundColor: '#FF0000',
                borderColor: "rgba(0,0,255,0.1)",
                data: commodityCompareValueArray
            };

            //Checking whether there is already a compare line and if there is remove it and add a new one
            if(myChart.data.datasets.length == 2) {
                myChart.data.datasets.pop();
                myChart.data.datasets.push(newData2);
                myChart.update();
            } else {
                //Add new compare line if there isnt one
                myChart.data.datasets.push(newData2);
                myChart.update();
            }
            // console.log(commodityCompareValueArray); //Testing Purposes
        }
    }

    function remove() {
        //Getting the value
        var displayIndex = displayedArray.indexOf(dropDownValue);
        //Testing Purposes
        // var descIndex = itemArray.findIndex(item => item.information === value);
        // var value = ui.descriptionContainer.getAttribute("value");
        // alert(descIndex);
        // alert(dropDownValue);
        // alert(displayIndex);
        //Removing the item from array
        displayedArray.splice(displayIndex, 1);
        //Testing Purposes
        // console.log(displayedArray);

        //Removing the widget
        ui.container.remove();
        ui.descriptionContainer.remove();
        ui.graphButton.remove();
        ui.removeButton.remove();
    }
}
