# import ptvsd
# ptvsd.enable_attach(address=('0.0.0.0', 5678))
# ptvsd.wait_for_attach()

from flask import Flask, render_template,request,make_response,jsonify
import requests
import pandas as pd
import json
import os
import time
from orp import orp2reg

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


def regionsToAPI(regions,orp2reg):
    d_regs = {i:r for i,r in enumerate(regions)}
    return [1 if d_regs[orp2reg[i]] else 2 for i in range(len(orp2reg.keys()))]

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

    api_params = {
        'Reopen_School':params['school']['main'],
        'Reopen_Work':params['work']['main'],
        'Reopen_Other':params['other']['main'],
        'Reopen_OtherS':params['other']['senior'],
        'Reopen_Home':params['home']['main'],
        'Reopen_HomeS':params['home']['senior'],
        'Reopen_Protection':1-params['mask']['main'],
        'Reopen_ProtectionS':1-params['mask']['senior'],
        'closeORP':regionsToAPI(params['regions'],orp2reg)
    }

    try:
        start = time.time()
        print('Requesting model at {} for params: {}'.format(time.ctime(start),str(params)))

        datstring = "Reopen_School={Reopen_School}&Reopen_Work={Reopen_Work}&Reopen_Other={Reopen_Other}&Reopen_OtherS={Reopen_OtherS}&Reopen_Home={Reopen_Home}&Reopen_HomeS={Reopen_HomeS}&Reopen_Protection={Reopen_Protection}&Reopen_ProtectionS={Reopen_ProtectionS}&closeORP={closeORP}".format(**api_params)
        print(datstring)
        response = requests.post(os.getenv('API_HOST') + '/model',data=datstring)
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

