import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// Company structure type
interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  skills: string[];
  status: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  employees: Employee[];
}

interface CompanyStructure {
  version: string;
  updatedAt: string;
  company: {
    name: string;
    departments: Department[];
  };
}

// GET /api/v1/company/structure - Get company structure
router.get('/structure', async (_req: Request, res: Response) => {
  try {
    const filePath = path.join(__dirname, '../../data/company-structure.json');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '公司架构文件不存在'
        },
        timestamp: Date.now()
      });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CompanyStructure;

    res.json({
      success: true,
      data: data.company,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error reading company structure:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '读取公司架构失败'
      },
      timestamp: Date.now()
    });
  }
});

// GET /api/v1/company/employees - Get all employees (flat list)
router.get('/employees', async (_req: Request, res: Response) => {
  try {
    const filePath = path.join(__dirname, '../../data/company-structure.json');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '公司架构文件不存在'
        },
        timestamp: Date.now()
      });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CompanyStructure;
    
    // Extract all employees from all departments
    const allEmployees: Array<{
      id: string;
      name: string;
      role: string;
      department: string;
      email: string;
      skills: string[];
      status: string;
    }> = [];

    data.company.departments.forEach(dept => {
      dept.employees.forEach(emp => {
        allEmployees.push({
          ...emp,
          department: dept.name
        });
      });
    });

    res.json({
      success: true,
      data: {
        departments: data.company.departments,
        employees: allEmployees
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error reading employees:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '读取员工列表失败'
      },
      timestamp: Date.now()
    });
  }
});

// GET /api/v1/company/departments - Get all departments
router.get('/departments', async (_req: Request, res: Response) => {
  try {
    const filePath = path.join(__dirname, '../../data/company-structure.json');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '公司架构文件不存在'
        },
        timestamp: Date.now()
      });
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CompanyStructure;

    res.json({
      success: true,
      data: data.company.departments,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error reading departments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '读取部门列表失败'
      },
      timestamp: Date.now()
    });
  }
});

export default router;
