from flask import Flask, render_template,request

# set the project root directory as the static folder, you can set others.
app = Flask(__name__,template_folder='../static',static_url_path='/',static_folder='../static') #

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

