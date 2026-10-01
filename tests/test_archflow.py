import importlib.util
import json
import math
import sys
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
SCRIPT = REPO / "skills" / "archflow-studio" / "scripts" / "archflow.py"
SPEC = importlib.util.spec_from_file_location("archflow", SCRIPT)
archflow = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
sys.modules[SPEC.name] = archflow
SPEC.loader.exec_module(archflow)


class ArchFlowTests(unittest.TestCase):
    def test_position_at_corners_and_interpolation(self):
        route = archflow.Route(
            id="corner",
            points=((0.0, 0.0), (10.0, 0.0), (10.0, 10.0)),
            phase=0.0,
            reverse=False,
            speed=5.0,
            diameter=4,
            color="#00F0FF",
        )
        self.assertEqual(archflow.position_at(route, 0), (0.0, 0.0))
        self.assertEqual(archflow.position_at(route, 1), (5.0, 0.0))
        self.assertEqual(archflow.position_at(route, 2), (10.0, 0.0))
        self.assertEqual(archflow.position_at(route, 3), (10.0, 5.0))

    def test_multidot_phase_offset(self):
        route = archflow.Route(
            id="stream",
            points=((0.0, 0.0), (100.0, 0.0)),
            phase=0.0,
            reverse=False,
            speed=10.0,
            diameter=4,
            color="#00F0FF",
            dot_count=2,
        )
        pos0 = archflow.position_at(route, 0, phase_offset=0.0)
        self.assertEqual(pos0, (0.0, 0.0))

        pos1 = archflow.position_at(route, 0, phase_offset=0.5)
        self.assertEqual(pos1, (50.0, 0.0))

    def test_bezier_sampling(self):
        p0 = (0.0, 0.0)
        p1 = (50.0, 100.0)
        p2 = (100.0, 0.0)
        curve = archflow._sample_bezier([p0, p1, p2], steps=10)
        self.assertEqual(len(curve), 11)
        self.assertEqual(curve[0], p0)
        self.assertEqual(curve[-1], p2)

    def test_normalize_config_validates_routes(self):
        config = {
            "image_size": [100, 100],
            "routes": [
                {
                    "id": "valid",
                    "points": [[10, 10], [90, 90]],
                    "dot_count": 3,
                    "glow": True,
                }
            ],
        }
        frames, delay_ms, routes = archflow.normalize_config(config, (100, 100))
        self.assertEqual(len(routes), 1)
        self.assertEqual(routes[0].dot_count, 3)
        self.assertTrue(routes[0].glow)


if __name__ == "__main__":
    unittest.main()
