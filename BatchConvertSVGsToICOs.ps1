# This script converts SVGs into multi-size *.ico files en masse.
# This script requires that both Inkscape and ImageMagick are installed.
#
# At the time of writing, the Inkscape process occasionally doesn't exit
# after converting a SVG to PNG.  In this case, it holds up the entire script.
# I've found that it's best to watch the process work, and when it 
# gets stuck, kill the "Inkscape" task through the Task Manager.
#
# Written by Nathan Friend on February 16, 2018
#
# Some sources used in writing this script:
#   - https://stackoverflow.com/a/14174624/1063392
#   - https://stackoverflow.com/a/16922387/1063392
#   - https://stackoverflow.com/a/3244679/1063392


# Set the working directory to the folder that contains all the SVGs
Set-Location "C:\Path\To\Your\SVG\Folder"

# Loop over all SVGs in the current directory
Get-ChildItem "C:\Path\To\Your\SVG\Folder" -Filter *.svg |
ForEach-Object {

    Write-Output "Converting $($_.Name)..."

    # Convert the SVGs into each resolution we need for the final .ico.
    # The path to "inkscape.com" may need to be updated if Inkscape is installed elsewhere
    & "C:\Program Files\Inkscape\inkscape.com" -z -e "$($_.BaseName)-16.png" -w 16 -h 16 $_.Name
    & "C:\Program Files\Inkscape\inkscape.com" -z -e "$($_.BaseName)-32.png" -w 32 -h 32 $_.Name
    & "C:\Program Files\Inkscape\inkscape.com" -z -e "$($_.BaseName)-48.png" -w 48 -h 48 $_.Name
    & "C:\Program Files\Inkscape\inkscape.com" -z -e "$($_.BaseName)-256.png" -w 256 -h 256 $_.Name

    # Combine all the PNGs created above into a single .ico using ImageMagick.
    convert "$($_.BaseName)-16.png" "$($_.BaseName)-32.png" "$($_.BaseName)-48.png" "$($_.BaseName)-256.png" "$($_.BaseName).ico"

    Write-Output ""
}

# Change the working directory back to its original location
Set-Location "C:\Path\To\Your\Original\Directory"

