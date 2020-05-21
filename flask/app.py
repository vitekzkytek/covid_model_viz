# import ptvsd
# ptvsd.enable_attach(address=('0.0.0.0', 5678))
# ptvsd.wait_for_attach()

from flask import Flask, render_template,request,make_response,jsonify
import requests
import pandas as pd
import json
import os
import time

app = Flask(__name__,template_folder='static',static_url_path='/',static_folder='static')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/sample')
def sample():
    path = './json/model_sample.json'
    if os.path.isfile(path):
        d = json.load(open(path,'r'))
        return {'success':True,'result':d}
    else:
        return {'success':False,'error_msg':'File {} does not exist'.format(path)}

@app.route('/contact_matrices')
def contact_matrices():
    path = './json/contact_matrices.json'
    if os.path.isfile(path):
        d = json.load(open(path,'r'))
        return {'success':True,'result':d}
    else:
        return {'success':False,'error_msg':'File {} does not exist'.format(path)}


@app.route('/run_simulation',methods=['GET','POST'])
def run_simulation():
    params = request.get_json()
    with open('json/contact_matrices.json') as f:
        matrices = json.load(f)
    con_labels = {
        'home':'con_Home',
        'work':'con_Work',
        'other':'con_Other',
        'school':'con_School'
    }
    conmats = {con_labels[matrix]:(pd.DataFrame(matrices[matrix])*params[matrix]['intensity']).values.T.tolist() for matrix in matrices}
    
    api_params = {
    # 'contact_matrices':conmats,
        'Reopen_School':params['school']['intensity'],
        'Reopen_School_Seniors':str(params['school']['seniors']).upper(),
        'Reopen_Work':params['work']['intensity'],
        'Reopen_Work_Seniors':str(params['work']['seniors']).upper(),
        'Reopen_Other':params['other']['intensity'],
        'Reopen_Other_Seniors':str(params['other']['seniors']).upper(),
        'Reopen_Home':params['home']['intensity'],
        'Reopen_Protection':params['mask']['intensity'],
        'Reopen_Protection_Seniors':str(params['mask']['seniors']).upper(),
        'closeORP':str([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1])
    }

    try:
        start = time.time()
        print('Requesting model at {} for params: {}'.format(time.ctime(start),str(params)))

        datstring = "Reopen_School={Reopen_School}&Reopen_School_Seniors={Reopen_School_Seniors}&Reopen_Work={Reopen_Work}&Reopen_Work_Seniors={Reopen_Work_Seniors}&Reopen_Other={Reopen_Other}&Reopen_Other_Seniors={Reopen_Other_Seniors}&Reopen_Home={Reopen_Home}&Reopen_Protection={Reopen_Protection}&Reopen_Protection_Seniors={Reopen_Protection_Seniors}&closeORP={closeORP}".format(**api_params)
        print(datstring)
        response = requests.post('http://51.15.75.174/model',data=datstring)
        end = time.time()
        print('Receiving reponse at {}'.format(time.ctime(end)))

        if response.ok:
            output = json.loads(response.content.decode())#response.json()#
            resp = { #make_response(jsonify(
                'success':True,
                'result':output,
                'elapsed':end-start,
                'timestamp':time.ctime(end)
            }#), 100)
            print('sending it back now!')
            return resp
        else:
            return { 
                'success':False,
                'error-msg':'Model API call failed. Reason: {}'.format(response.reason),
                'elapsed':end-start,
                'timestamp':end
            }
    except Exception as e:
        print(e)
        return {'success':False,'error-msg':e,'timestamp':time.ctime(time.time())}


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

