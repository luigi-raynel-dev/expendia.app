import { FormEmail } from '../screens/Email'
import { ExpenseDetails } from '../screens/Expense'
import { ExpenseForm } from '../screens/ExpenseName'
import { GroupForm } from '../screens/GroupName'
import { GroupProps } from '../screens/Groups'
import { PasswordParams } from '../screens/Password'
import { HandlePayingProps } from '../screens/PayingMembers'
import { HandleMembersProps } from '../screens/RecentMembers'
import { FormSignUp } from '../screens/SignUp'
import { Configurations } from '../screens/Configurations'
import { Logout } from '../screens/Logout'
import { SignInParams } from '../screens/SignIn'
import { GroupRoute } from '../screens/Expenses'
export declare global {
  namespace ReactNavigation {
    interface RootParamList {
      Home: undefined
      Email: FormEmail | undefined
      SignIn: SignInParams
      SignUp: FormEmail
      Register: FormSignUp
      PasswordRecovery: FormEmail
      ValidateCode: FormEmail
      Password: PasswordParams
      Groups: undefined
      Group: GroupProps
      GroupName: undefined
      GroupMembers: GroupForm
      RecentMembers: HandleMembersProps
      Expenses: GroupRoute
      Expense: ExpenseDetails
      ExpenseName: ExpenseForm
      ExpenseCost: ExpenseForm
      ExpensePayers: ExpenseForm
      PayingMembers: HandlePayingProps
      Configurations: undefined
      Logout: undefined
      Profile: undefined
      RequestAccountDeletion: undefined
      DeleteAccount: undefined
    }
  }
}
