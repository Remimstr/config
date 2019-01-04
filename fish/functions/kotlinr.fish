function kotlinr
  echo "Compiling, please wait..."
  kotlinc $argv -include-runtime -d out.jar
  java -jar out.jar
end
