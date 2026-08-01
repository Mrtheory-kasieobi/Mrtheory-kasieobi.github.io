import Mathlib

variable {R : Type*} [CommRing R]

theorem ideal_sup_self (I : Ideal R) : I ⊔ I = I := by
  exact sup_idem I