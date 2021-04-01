# Set up caMicroscope for Windows 10 Home

1. Install Windows Subsystem for Linux (WSL2) from the link given here: <a href = "https://docs.microsoft.com/en-us/windows/wsl/install-win10#manual-installation-steps">WSL2</a>, **FOLLOW STEPS 1 to 5 ONLY (Step 6 - Install your Linux distribution of choice IS NOT REQUIRED)** 
2. After completing all the five steps, <a href = "">Install Docker Desktop for Windows</a>, click on the "Get Docker" button on the right and run the "Docker Desktop Installer" to complete the installation.
3. Now, select any folder (say E:/) and open the command prompt.
4. Clone the Distro repository using <code>git clone</code> commands given below:<br>
    <code>git clone https://github.com/camicroscope/Distro.git</code><br>

5. Open the "caMicroscope.yml" file which can be found in the Distro folder, "Distro/caMicroscope.yml".
6. Add <code>DISABLE_SEC: "true"</code> as shown below, adding this line will help us get rid of JsonWebTokenError.

![disable_sec](https://user-images.githubusercontent.com/40331239/113166920-d4d24d80-9260-11eb-9bc1-7cb8d301c46c.jpg)

7. Now we are ready to build the docker images, go ahead and execute <code>docker-compose -f caMicroscope.yml build</code> command from the command prompt (Make sure that you are in the Distro directory).
8. After the build has completed successfully, execute <code>docker-compose -f caMicroscope.yml up</code> command to run the application.
9. Go to http://localhost:4010/ on your web browser to see the application running.
10. Finally, if you wish to stop the application, execute <code>docker-compose -f caMicroscope.yml down</code> command.
