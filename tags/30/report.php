<html>
<head>
	<title>Report form for RegExpresso</title>
	<style>
		.query { background-color:#DBFF00; border:solid black 1px; }
		table { border-collapse:collapse; empty-cells:show; }
		th, td { border:solid black 1px; text-align:center; }
		.error { color:red; }
	</style>
</head>
<body>
<?php
	function getParam( $name, $default )
	{
		return isset($_REQUEST[$name]) ? $_REQUEST[$name] : $default;
	}

	// caches the fixtures in an associative array
	function getFixtures( $db )
	{
		$tests_fixture = mysql_query("select id,subject,regex,highlight,backref,empty,stylesheets,results from tests_fixture",$db);
		while ( $row=mysql_fetch_row($tests_fixture) )
			$fixtures[$row[0]] = array( "subject"=>$row[1], "regex"=>$row[2], "highlight"=>$row[3], "backref"=>$row[4], "empty"=>$row[5], "stylesheets"=>$row[6], "results"=>$row[7] );
		return $fixtures;
	}

	// gets the ID of the fixture described by the parameters
	function getFixtureID( $db, $subject, $regex, $highlight, $backref, $empty, $stylesheets, $results )
	{
		$statement = "select id from tests_fixture where subject='$subject'";
		$statement .= " and regex='$regex'";
		$statement .= " and highlight='$highlight'";
		$statement .= " and backref='$backref'";
		$statement .= " and empty='$empty'";
		$statement .= " and stylesheets='$stylesheets'";
		$statement .= " and results='$results'";
		$fixture_id = mysql_result( mysql_query($statement,$db), 0, "id" );
		return $fixture_id;
	}

	// caches the reports in an associative array
	function getReports( $db )
	{
		$statement = "select id,tester,navigator,fixture,success,date,comment from tests_report";
		$statement .= " order by date DESC";
		$tests_report = mysql_query($statement,$db);
		while ( $row=mysql_fetch_row($tests_report) )
			$reports[$row[0]] = array( "tester"=>$row[1], "navigator"=>$row[2], "fixture"=>$row[3], "success"=>$row[4], "date"=>$row[5], "comment"=>$row[6] );
		return $reports;
	}

	function getNavigators( $db )
	{
		$tests_navigator = mysql_query("select id,user_agent from tests_navigator",$db);
		while ( $row=mysql_fetch_row($tests_navigator) )
			$navigators[$row[0]] = $row[1];
		return $navigators;
	}

	function printReports( $reports )
	{
		echo "<p><table><caption>REPORTS</caption>";
		echo "<tr><th>id</th><th>tester</th><th>navigator</th><th>fixture</th><th>success</th><th>date</th><th>comment</th></tr>";
		foreach ( $reports as $r_id => $r )
		{
			echo "<tr>";
			echo "<td>$r_id</td>";
			echo "<td style='text-align:justify;'>".$r["tester"]."</td>";
			echo "<td><a href='#navigator_".$r["navigator"]."'>".$r["navigator"]."</a></td>";
			echo "<td><a href='#fixture_".$r["fixture"]."'>".$r["fixture"]."</a></td>";
			echo "<td>".$r["success"]."</td>";
			echo "<td>".$r["date"]."</td>";
			echo "<td style='text-align:justify;'>".$r["comment"]."</td>";
			echo "</tr>";
		}
		echo "</table></p>";
	}

	function printFixtures( $fixtures )
	{
		echo "<p><table><caption>FIXTURES</caption>";
		echo "<tr><th>id</th><th>subject</th><th>regex</th><th>highlight</th><th>backref</th><th>empty</th><th>stylesheets</th></tr>";
		foreach ( $fixtures as $f_id => $f )
		{
			echo "<tr>";
			echo "<td><a name='fixture_".$f_id."'>".$f_id."</a></td>";
			echo "<td style='text-align:justify;'>".$f["subject"]."</td>";
			echo "<td style='text-align:justify;'>".$f["regex"]."</td>";
			echo "<td>".$f["highlight"]."</td>";
			echo "<td style='text-align:justify;'>".$f["backref"]."</td>";
			echo "<td style='text-align:justify;'>".$f["empty"]."</td>";
			echo "<td style='text-align:justify;'>".$f["stylesheets"]."</td>";
			echo "</tr>";
		}
		echo "</table></p>";
	}

	// $reports may be null
	function printNavigators( $navigators, $fixtures, $reports )
	{
		// prints the navigators
		echo "<p><table><caption>NAVIGATORS</caption>";
		echo "<tr><th>id</th><th>user-agent</th>" . (isset($reports)?"<th>successful tests</th>":"") . "</tr>";
		foreach ( $navigators as $nav_id => $nav_agent )
		{
			echo "<tr>";
			echo "<td><a name='navigator_".$nav_id."'>".$nav_id."</a></td>";
			echo "<td style='text-align:justify;'>".$nav_agent."</td>";
			if ( isset($reports) )
			{
				$failures = 0;
				foreach ( $fixtures as $f_id => $f )
				{
					foreach ( $reports as $r_id => $r )
					{
						if ( $r["navigator"] == $nav_id && $r["success"] == "false" )
						{
							$failures++;
							break;
						}
					}
				}
				echo "<td>".(count($fixtures)-$failures)."/".count($fixtures)."</td>";
			}
			echo "</tr>";
		}
		echo "</table></p>";
	}

	// required params
	$hostname = "db.berlios.de";
	$database = "regexpresso";
	$username = getParam("username",null);
	$password = getParam("password",null);
	$action = getParam("action",null);

	// auto-fill form params
	$useragent = getParam("useragent",null);
	$tester = getParam("tester",null);
	$subject = getParam("subject",null);
	$regex = getParam("regex",null);
	$highlight = getParam("highlight",null);
	$backref = getParam("backref",null);
	$empty = getParam("empty",null);
	$stylesheets = getParam("stylesheets",null);
	$success = getParam("success",null);
	$comment = getParam("comment",null);
	$results = getParam("results",null);

	if ( isset($username) && isset($password) )
	{
		// makes the db connection available for all operations enclosed in the 'if' statement
		$db = mysql_connect($hostname,$username,$password);
		if ( $db && mysql_selectdb($database,$db) )
		{
			// this is used to know whether or not a fixture could be identified
			$fixture_id = null;

			// submitting a report
			if ( isset($action) && $action == "submit" && isset($fixture_id) )
			{
				echo "<h1>Reporting a test result</h1>";

				// tests for the existence of this fixture
				if ( isset($subject) && isset($regex) && isset($highlight) && isset($backref) && isset($results) )
				{
					$fixture_id = getFixtureID($db,$subject,$regex,$highlight,$backref,$empty,$stylesheets,$results);
					if ( isset($fixture_id) )
					{
						// inserts the navigator if new
						if ( isset($useragent) )
						{
							$statement = "select id from tests_navigator where user_agent='$useragent'";
							$navigator_id = mysql_result( mysql_query($statement,$db), 0, "id" );
							if ( $navigator_id == null )
							{
								mysql_query("select COUNT(*) from tests_navigator",$db);	// needed to set the autoincrement counter (?)
								$statement = "insert into tests_navigator values(NULL,'$useragent')";
								echo "<div class='query'>$statement --&gt;";
								$result = mysql_query($statement,$db);
								echo "$result</div>";
								$navigator_id = mysql_insert_id();
							}

							// inserts the report
							// @todo : one for each tester, so update if existing
							if ( isset($tester) && isset($navigator_id) && isset($fixture_id) && isset($success) )
							{
								mysql_query("select COUNT(*) from tests_report",$db);	// needed to set the autoincrement counter (?)
								$statement = "insert into tests_report values(NULL,'$tester',$navigator_id,$fixture_id,'$success',CURRENT_TIMESTAMP,'$comment')";
								echo "<div class='query'>$statement --&gt;";
								$result = mysql_query($statement,$db);
								echo "$result</div>";
							}
						}
					}
				}

				// anyway, shows the whole db
				$fixtures = getFixtures($db);
				$reports = getReports($db);
				$navigators = getNavigators($db);
				printFixtures($fixtures);
				printNavigators($navigators,$fixtures,$reports);
				printReports($reports);
			}



			// inserts the fixture if new
			else if ( isset($action) && ($action == "new" || $action == "submit") )
			{
				if ( !isset($fixture_id) )
				{
					if ( isset($subject) && isset($regex) && isset($highlight) && isset($backref) && isset($results) )
					{
						mysql_query("select COUNT(*) from tests_fixture",$db);	// needed to set the autoincrement counter (?)
						$statement = "insert into tests_fixture values(NULL,'$subject','$regex','$highlight','$backref','$empty','$stylesheets','$results')";
						echo "<div class='query'>$statement --&gt;";
						$result = mysql_query($statement,$db);
						echo "$result</div>";
						$fixture_id = mysql_insert_id();
					}
					else
					{
						echo "<span class='error'>Need at least 'subject', 'regex', 'highlight', 'backref' and 'results'.</span>";
					}
				}
				else
				{
					echo "<span class='error'>This fixture already exists.</span>";
				}

				$fixtures = getFixtures($db);
				$navigators = getNavigators($db);
				printFixtures($fixtures);
				printNavigators($navigators,$fixtures,nul);
			}


			else if ( isset($action) && $action == "fixtures.js" )
			{
				$fixtures = getFixtures($db);

				// outputs the fixtures as a Javascript array
				echo "var fixtures = [";
				$f_first = true;
				foreach ( $fixtures as $f_id => $f )
				{
					echo ($f_first?"":",");
					echo "[\"".$f["subject"]."\",\n";
					echo "\"".$f["regex"]."\",\n";
					echo "\"".$f["highlight"]."\",\n";
					echo "\"".$f["backref"]."\",\n";
					echo "\"".$f["empty"]."\",\n";
					echo "\"".$f["stylesheets"]."\",\n";
					echo "[";
						$comments = split("\n",$f["results"]);
						for ( $c=0 ; $c<count($comments)-1 ; $c++ )
							echo ($c>0?",":"") . "\"" . $comments[$c] . "\"";
						echo "]\n";
					echo "]";
					$f_first = false;
				}
				echo "];";
			}



			// proposing a new test fixture
			else
			{
				echo "<h1>Proposing a new test fixture</h1>";

				echo "<form action='".$_SERVER["PHP_SELF"]."'>";
				echo "<input type='hidden' name='action' value='new'>";
				echo "<table>";
				echo "<tr><td>Subject :</td><td><textarea name='subject'>".$subject."</textarea></td></tr>";
				echo "<tr><td>Regular expression :</td><td><input type='text' name='regex' value='".$regex."'></td></tr>";
				echo "<tr><td>Highlight :</td><td><input type='text' name='highlight' value='".($highlight=="true"?"on":"")."'></td></tr>";
				echo "<tr><td>Backreference :</td><td><input type='text' name='backref' value='".$backref."'></td></tr>";
				echo "<tr><td>'Empty' filler :</td><td><input type='text' name='empty' value='".$empty."'></td></tr>";
				echo "<tr><td>Stylesheets :</td><td><textarea name='stylesheets'>".$stylesheets."</textarea></td></tr>";
				echo "<tr><td>Result :</td><td><textarea name='results' rows='2'>$comment</textarea></td></tr>";
				echo "</table>";
				echo "<input type='submit' value='SUBMIT'>";
				echo "</form>";

				// Existing fixtures as a reference
				$fixtures = getFixtures($db);
				printFixtures($fixtures);
			}

			// ends the session
			mysql_close($db);
		}
		else
		{
			echo "<span class='error'>Cannot connect to the '$database' database at '$hostname'</span>";
		}
	}
	else
	{
		echo "<span class='error'>Need both 'username' and 'password'</span>";
	}
?>
</body>
</html>