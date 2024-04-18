import { LinkingOptions, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Home from '../screens/Home'
import Email from '../screens/Email'
import SignIn from '../screens/SignIn'
import Groups from '../screens/Groups'
import { useAuth } from '../hooks/useAuth'
import Loading from '../components/Loading'
import SignUp from '../screens/SignUp'
import Register from '../screens/Register'
import PasswordRecovery from '../screens/PasswordRecovery'
import ValidateCode from '../screens/ValidateCode'
import Password from '../screens/Password'
import Expenses from '../screens/Expenses'
import GroupName from '../screens/GroupName'
import GroupMembers from '../screens/GroupMembers'
import RecentMembers from '../screens/RecentMembers'
import ExpenseName from '../screens/ExpenseName'
import ExpenseCost from '../screens/ExpenseCost'
import ExpensePayers from '../screens/ExpensePayers'
import PayingMembers from '../screens/PayingMembers'
import Expense from '../screens/Expense'
import Configurations from '../screens/Configurations'
import Logout from '../screens/Logout'
import Group from '../screens/Group'
import Profile from '../screens/Profile'
import RequestAccountDeletion from '../screens/RequestAccountDeletion'
import DeleteAccount from '../screens/DeleteAccount'
import { createURL } from 'expo-linking'

const linking: LinkingOptions<ReactNavigation.RootParamList> = {
  prefixes: [createURL('/')],
  config: {
    screens: {
      Expenses: {
        path: 'group/:groupId',
        parse: {
          groupId: (groupId: string) => groupId
        }
      },
      Expense: {
        path: 'expense/:expenseId',
        parse: {
          expenseId: (expenseId: string) => expenseId
        }
      }
    }
  }
}

export default function Routes() {
  const { Navigator, Screen } = createNativeStackNavigator()
  const { isUserLoading, user } = useAuth()

  return isUserLoading ? (
    <Loading />
  ) : (
    <NavigationContainer linking={linking} fallback={<Loading />}>
      <Navigator
        initialRouteName={user.email ? 'Groups' : 'Home'}
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: 'black'
          }
        }}
      >
        <Screen name="Home" component={Home} />
        <Screen name="Email" component={Email} />
        <Screen name="SignIn" component={SignIn} />
        <Screen name="SignUp" component={SignUp} />
        <Screen name="Register" component={Register} />
        <Screen name="PasswordRecovery" component={PasswordRecovery} />
        <Screen name="ValidateCode" component={ValidateCode} />
        <Screen name="Password" component={Password} />
        <Screen name="Group" component={Group} />
        <Screen name="Groups" component={Groups} />
        <Screen name="GroupName" component={GroupName} />
        <Screen name="GroupMembers" component={GroupMembers} />
        <Screen name="RecentMembers" component={RecentMembers} />
        <Screen name="Expenses" component={Expenses} />
        <Screen name="Expense" component={Expense} />
        <Screen name="ExpenseName" component={ExpenseName} />
        <Screen name="ExpenseCost" component={ExpenseCost} />
        <Screen name="ExpensePayers" component={ExpensePayers} />
        <Screen name="PayingMembers" component={PayingMembers} />
        <Screen name="Configurations" component={Configurations} />
        <Screen name="Logout" component={Logout} />
        <Screen name="Profile" component={Profile} />
        <Screen
          name="RequestAccountDeletion"
          component={RequestAccountDeletion}
        />
        <Screen name="DeleteAccount" component={DeleteAccount} />
      </Navigator>
    </NavigationContainer>
  )
}
