function aserver
  python setup.py bdist_wheel
  pip install --upgrade dist/aserver-0.2-py3-none-any.whl
  export FLASK_APP=aserver/main.py
  export FLASK_DEBUG=1
  flask run
end
