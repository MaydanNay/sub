import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

import models
import main
from unittest.mock import MagicMock

def test_get_teacher_classes():
    print("Testing get_teacher_classes...")
    
    # Mock user
    mock_user = MagicMock()
    mock_user.role = "teacher"
    mock_user.assigned_classes = ["10-A"]
    mock_user.school_id = 1
    
    # Mock DB session
    mock_db = MagicMock()
    
    # Test default scope (should be 'assigned')
    result = main.get_teacher_classes(scope="assigned", db=mock_db, current_user=mock_user)
    print(f"Result with scope='assigned': {result}")
    assert result == ["10-A"]
    
    # Test with no scope provided (should default to 'assigned' now)
    # Note: In FastAPI, the default value is handled by the framework, so we pass it explicitly or simulate the call
    result_default = main.get_teacher_classes(db=mock_db, current_user=mock_user)
    print(f"Result with default scope: {result_default}")
    assert result_default == ["10-A"]
    
    # Mock user with NO assigned classes
    mock_user_no_classes = MagicMock()
    mock_user_no_classes.role = "teacher"
    mock_user_no_classes.assigned_classes = None
    
    result_none = main.get_teacher_classes(db=mock_db, current_user=mock_user_no_classes)
    print(f"Result for user with no classes: {result_none}")
    assert result_none == []

    print("✅ Verification successful!")

if __name__ == "__main__":
    test_get_teacher_classes()
