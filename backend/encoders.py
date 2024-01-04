from json import JSONEncoder
from flask.json.provider import JSONProvider

class MyEncoder(JSONEncoder):
        def default(self, o):
            return o.__dict__

class CustomJSONProvider(JSONProvider):
    
    
    def dumps(self, obj, **kwargs):
        return json.dumps(obj, **kwargs, cls=MyEncoder)

    def loads(self, s, **kwargs):
        return json.loads(s, **kwargs)
