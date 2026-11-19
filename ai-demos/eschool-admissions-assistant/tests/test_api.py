import json
import sys
import threading
import unittest
from pathlib import Path
from urllib import request, error

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'backend'))
from server import serve

class APITests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server=serve(0)
        cls.url='http://127.0.0.1:'+str(cls.server.server_port)
        cls.worker=threading.Thread(target=cls.server.serve_forever,daemon=True)
        cls.worker.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.worker.join(timeout=3)

    def post(self,path,payload):
        req=request.Request(self.url+path, data=json.dumps(payload).encode(),headers={'Content-Type':'application/json'},method='POST')
        with request.urlopen(req,timeout=3) as response:
            return json.load(response)

    def test_health_and_service_mode(self):
        with request.urlopen(self.url+'/api/health',timeout=3) as r:
            body=json.load(r)
        self.assertEqual(body['status'],'ok')
        self.assertFalse(body['llm_configured'])

    def test_served_html_has_api_mode(self):
        with request.urlopen(self.url+'/demo.html',timeout=3) as r:
            text=r.read().decode()
        self.assertIn('name="demo-api" content="enabled"',text)

    def test_search(self):
        payload={'query':'Primary school in Kampala under UGX 4 million','filters':{},'sort':'match'}
        resp=self.post('/api/search',payload)
        self.assertEqual({x['id'] for x in resp['results']},{'sch-001','sch-006'})
        self.assertEqual(len(resp['grounding']['schools']),2)

    def test_no_match(self):
        resp=self.post('/api/search',{'query':'','filters':{'level':'Nursery','max_annual_fee_ugx':5000000}})
        self.assertEqual(resp['results'],[])

    def test_answer_missing_deadline(self):
        resp=self.post('/api/ask',{'query':'What is the deadline for Hillside Grove International?'})
        self.assertIn('not available',resp['answer'])
        self.assertEqual(resp['mode'],'rules')

    def test_invalid_filter_rejected(self):
        with self.assertRaises(error.HTTPError) as ctx:
            self.post('/api/search',{'query':'','filters':{'unknown':'value'}})
        self.assertEqual(ctx.exception.code,400)

if __name__=='__main__':unittest.main()