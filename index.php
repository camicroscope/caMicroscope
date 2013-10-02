<?php session_start(); ?>


<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>index</title>
		<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs    /jquery/1.3.2/jquery.min.js"></script>
		<script charset="utf-8" type="text/javascript" src="/bootstrap/js/mootools_and_boostrap.js"></script>
		<link rel="stylesheet" href="/bootstrap/css/bootstrap.css" />
		<style type="text/css">
			body {
				padding-top: 150px;
				height: 100%;
				background-color: #f5f5f5;
			}

			.form-signin {
				max-width: 300px;
				padding: 19px 29px 29px;
				margin: 0 auto 20px;
				background-color: #fff;
				border: 1px solid #e5e5e5;
				-webkit-border-radius: 5px;
				-moz-border-radius: 5px;
				border-radius: 5px;
				-webkit-box-shadow: 0 1px 2px rgba(0,0,0,.05);
				-moz-box-shadow: 0 1px 2px rgba(0,0,0,.05);
				box-shadow: 0 1px 2px rgba(0,0,0,.05);
			}
			.form-signin .form-signin-heading, .form-signin .checkbox {
				margin-bottom: 10px;
			}
			.form-signin input[type="text"], .form-signin input[type="password"] {
				font-size: 16px;
				height: auto;
				margin-bottom: 15px;
				padding: 7px 9px;
			}

		</style>
		<link rel="stylesheet" href="css/bootstrap-responsive.css" />

	</head>

	<body>

		<div class="container">

			<form method="post" id="login" action="api/Security/auth.php" class="form-signin">
				<h2 class="form-signin-heading">caMicroscope</h2>
				<input type="text" name="username" placeholder="Username" class="input-block-level">
				<input type="password" name="password" placeholder="Password" class="input-block-level">
				
				<p>
					<input type="submit" class="btn btn-primary" value="Sign In"/>
						
					
					
				</p>

			</form>
		

		</div>
	</body>
</html>


