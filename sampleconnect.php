<?php

	//replace username with your username e.g. xyz12  in both places
	// and password with your password
   
   try{
   	
   	$con = new PDO('mysql:host=learn-mysql.cms.waikato.ac.nz;dbname=jh433','jh433','my206990sql');
   	} catch (PDOException $e) {
   		echo "Database connection error " . $e->getMessage();
   	}
   
