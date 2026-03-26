import pytest
from app.algorithms.sorting import run_sort, generate_dataset, SORTING_REGISTRY
from app.algorithms.dynamic_programming import lcs, coin_change, lis
from app.algorithms.misc import n_queens, kmp_search, sieve_of_eratosthenes

@pytest.mark.parametrize("algo", list(SORTING_REGISTRY.keys()))
def test_sort_correctness(algo):
    data = generate_dataset(50, "random")
    r = run_sort(algo, data)
    assert r["sorted"] == sorted(data)

@pytest.mark.parametrize("algo", list(SORTING_REGISTRY.keys()))
def test_sort_empty(algo):
    assert run_sort(algo, [])["sorted"] == []

def test_lcs():
    r = lcs("ABCBDAB", "BDCAB")
    assert r["length"] == 4

def test_coin_change():
    r = coin_change([1,5,6,9], 11)
    assert r["min_coins"] == 2

def test_lis():
    r = lis([10,9,2,5,3,7,101,18])
    assert r["length"] == 4

def test_n_queens():
    r = n_queens(8)
    assert r["total_solutions"] == 92

def test_kmp():
    r = kmp_search("AABAACAADAABAABA", "AABA")
    assert r["count"] == 3

def test_sieve():
    r = sieve_of_eratosthenes(50)
    assert 47 in r["primes"]
    assert 49 not in r["primes"]
