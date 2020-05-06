from flask import Flask, render_template,request
import json
import os

app = Flask(__name__,template_folder='../static',static_url_path='/',static_folder='../static') #

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/sample/<scenario>')
def sample(scenario):
    path = '../sample_json/{}.json'.format(scenario)
    if os.path.isfile(path):
        d = json.load(open(path,'r'))
        return {'scenario':scenario,'success':True,'result':d}
    else:
        return {'scenario':scenario, 'success':False,'error_msg':'File {} does not exist'.format(path)}

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

