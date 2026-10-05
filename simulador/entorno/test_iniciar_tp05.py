import importlib.util
import unittest
from unittest.mock import patch, MagicMock
from pathlib import Path
spec=importlib.util.spec_from_file_location('launcher',Path(__file__).parent/'iniciar_tp05.py')
launcher=importlib.util.module_from_spec(spec)
spec.loader.exec_module(launcher)

class LauncherTests(unittest.TestCase):
    def test_different_robot_does_not_launch(self):
        with patch('sys.argv',['launcher','--robot','g1']), patch.object(launcher,'robot_actual',return_value='go2'), patch.object(launcher.subprocess,'Popen') as launch:
            self.assertEqual(launcher.main(),1)
            launch.assert_not_called()

    def test_wrong_backend_does_not_launch(self):
        response=MagicMock()
        response.__enter__.return_value.read.return_value=b'{"modelo":"go2","modo":"simulador"}'
        with patch('sys.argv',['launcher','--robot','g1']), patch.object(launcher,'robot_actual',return_value=None), patch.object(launcher.socket,'socket') as sock, patch.object(launcher.urllib.request,'urlopen',return_value=response), patch.object(launcher.subprocess,'Popen') as launch:
            sock.return_value.__enter__.return_value.connect_ex.return_value=0
            self.assertEqual(launcher.main(),1)
            launch.assert_not_called()

    def test_existing_matching_pair_is_reused(self):
        response=MagicMock()
        response.__enter__.return_value.read.return_value=b'{"modelo":"g1","modo":"simulador"}'
        with patch('sys.argv',['launcher','--robot','g1']), patch.object(launcher,'robot_actual',return_value='g1'), patch.object(launcher.socket,'socket') as sock, patch.object(launcher.urllib.request,'urlopen',return_value=response), patch.object(launcher.subprocess,'Popen') as launch, patch.object(launcher.subprocess,'call') as call:
            sock.return_value.__enter__.return_value.connect_ex.return_value=0
            self.assertEqual(launcher.main(),0)
            launch.assert_not_called()
            call.assert_not_called()

if __name__=='__main__': unittest.main()
