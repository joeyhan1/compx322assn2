<?php
	//first connect to the database 
    require_once('./sampleconnect.php');  //replace with path and name for your connection script

    //create the sql query and send it
    $query = "select * from `commodities`";
    $result = $con->query($query);
    //Initialize array variable
    $items = array();
    while($row = $result->fetch()) {
        $items[] = $row;
    }
    //Converting the items into JSON format
    echo json_encode($items);
?>