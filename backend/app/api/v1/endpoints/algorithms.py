"""DP, backtracking, string, and math endpoints."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.algorithms.dynamic_programming import (
    fibonacci_all_methods, lcs, edit_distance,
    knapsack_01, coin_change, lis, matrix_chain,
)
from app.algorithms.misc import (
    n_queens, sudoku_solver, maze_solver,
    kmp_search, rabin_karp,
    sieve_of_eratosthenes, huffman_coding, gcd_lcm, fast_exponentiation,
)

router = APIRouter(tags=["algorithms"])


class DPRequest(BaseModel):
    algorithm: str
    params: dict


class BacktrackRequest(BaseModel):
    algorithm: str
    params: dict


class StringRequest(BaseModel):
    algorithm: str
    text: str
    pattern: Optional[str] = None


class MathRequest(BaseModel):
    algorithm: str
    params: dict


@router.post("/dp")
def run_dp(req: DPRequest):
    p = req.params
    match req.algorithm:
        case "fibonacci":     return fibonacci_all_methods(p.get("n", 10))
        case "lcs":           return lcs(p.get("s1", "ABCBDAB"), p.get("s2", "BDCAB"))
        case "edit_distance": return edit_distance(p.get("s1", "kitten"), p.get("s2", "sitting"))
        case "knapsack":      return knapsack_01(p.get("weights", [1, 3, 4, 5]), p.get("values", [1, 4, 5, 7]), p.get("capacity", 7))
        case "coin_change":   return coin_change(p.get("coins", [1, 5, 6, 9]), p.get("amount", 11))
        case "lis":           return lis(p.get("array", [10, 9, 2, 5, 3, 7, 101, 18]))
        case "matrix_chain":  return matrix_chain(p.get("dims", [40, 20, 30, 10, 30]))
        case _:
            raise HTTPException(404, f"DP algorithm '{req.algorithm}' not found")


@router.post("/backtrack")
def run_backtrack(req: BacktrackRequest):
    p = req.params
    match req.algorithm:
        case "n_queens": return n_queens(p.get("n", 8))
        case "sudoku":   return sudoku_solver(p.get("board", [[0] * 9 for _ in range(9)]))
        case "maze":     return maze_solver(p.get("maze", [[0] * 5 for _ in range(5)]), p.get("start", [0, 0]), p.get("end", [4, 4]))
        case _:
            raise HTTPException(404, f"Backtracking algorithm '{req.algorithm}' not found")


@router.post("/string")
def run_string(req: StringRequest):
    match req.algorithm:
        case "kmp":        return kmp_search(req.text, req.pattern or "")
        case "rabin_karp": return rabin_karp(req.text, req.pattern or "")
        case _:
            raise HTTPException(404, f"String algorithm '{req.algorithm}' not found")


@router.post("/math")
def run_math(req: MathRequest):
    p = req.params
    match req.algorithm:
        case "sieve":    return sieve_of_eratosthenes(p.get("limit", 100))
        case "huffman":  return huffman_coding(p.get("text", "hello world"))
        case "gcd_lcm":  return gcd_lcm(p.get("a", 48), p.get("b", 18))
        case "fast_exp": return fast_exponentiation(p.get("base", 2), p.get("exp", 10), p.get("mod", 10 ** 9 + 7))
        case _:
            raise HTTPException(404, f"Math algorithm '{req.algorithm}' not found")
