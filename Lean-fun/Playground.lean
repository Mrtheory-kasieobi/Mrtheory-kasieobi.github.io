import Mathlib

open Ideal

variable {R : Type*} [CommRing R]

theorem mul_top (I : Ideal R) :
    I * ⊤ = I := by
  simpa using Ideal.mul_top I
