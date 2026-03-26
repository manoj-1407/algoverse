def test_root(client): assert client.get("/").status_code == 200
def test_algorithms(client): r = client.get("/api/v2/algorithms"); assert "sorting" in r.json()
def test_sort(client):
    r = client.post("/api/v2/sort", json={"algorithm":"quicksort","data":[5,3,1,4,2]})
    assert r.status_code == 200; assert r.json()["sorted"] == [1,2,3,4,5]
def test_sort_unknown(client): assert client.post("/api/v2/sort", json={"algorithm":"fakesort","data":[1]}).status_code == 404
def test_compare(client):
    r = client.post("/api/v2/compare", json={"algorithms":["quicksort","mergesort"],"size":100})
    assert r.status_code == 200; assert "winner" in r.json()
def test_dp_fibonacci(client): r = client.post("/api/v2/dp", json={"algorithm":"fibonacci","params":{"n":10}}); assert r.status_code == 200
def test_backtrack_queens(client): r = client.post("/api/v2/backtrack", json={"algorithm":"n_queens","params":{"n":4}}); assert r.status_code == 200
